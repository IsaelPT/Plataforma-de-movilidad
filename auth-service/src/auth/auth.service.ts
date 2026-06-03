import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AuthSession, AuthSessionDocument } from './schemas/auth-session.schema';
import { LoginDto } from './dto/login.dto';
import { RecoveryPasswordDto } from './dto/recovery-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { BCRYPT_ROUNDS, JWT_TOKEN_HASH_ROUNDS, SESSION_EXPIRATION_MINUTES } from '../common/constants/app.constants';

interface RecoveryToken {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    userId: Types.ObjectId;
    email: string;
    role: string;
    profile: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      photoUrl: string;
    };
    isVerified: boolean;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private recoveryTokens: Map<string, RecoveryToken> = new Map();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AuthSession.name) private sessionModel: Model<AuthSessionDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.usersService.create(createUserDto);
  }

  async validateCredentials(loginDto: LoginDto): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  async generateJwtToken(user: UserDocument): Promise<string> {
    const payload = {
      sub: user._id,
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async login(loginDto: LoginDto, deviceInfo?: { deviceName?: string; ipAddress?: string }): Promise<LoginResponse> {
    const user = await this.validateCredentials(loginDto);
    const token = await this.generateJwtToken(user);

    const tokenHash = await bcrypt.hash(token, JWT_TOKEN_HASH_ROUNDS);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_EXPIRATION_MINUTES);

    await this.sessionModel.create({
      userId: user._id,
      tokenHash,
      deviceName: deviceInfo?.deviceName || 'Unknown',
      ipAddress: deviceInfo?.ipAddress || 'Unknown',
      expiresAt,
    });

    return {
      accessToken: token,
      user: {
        userId: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified,
      },
    };
  }

  async recoverPassword(recoveryPasswordDto: RecoveryPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(recoveryPasswordDto.email);
    
    if (!user) {
      // Security: Don't reveal if email exists
      return;
    }

    const token = uuidv4();
    const expirationMinutes = this.configService.get<number>('recoveryToken.expiration') || 15;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    this.recoveryTokens.set(user._id.toString(), {
      userId: user._id.toString(),
      token,
      expiresAt,
    });

    // In production, this would send an email
    // For security, we log without exposing the token in production
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`Recovery token for ${user.email}: ${token}`);
      this.logger.debug(`Token expires at: ${expiresAt}`);
    }
  }

  async resetPassword(userId: string, resetPasswordDto: ResetPasswordDto): Promise<void> {
    const recoveryToken = this.recoveryTokens.get(userId);

    if (!recoveryToken) {
      throw new BadRequestException('No se ha solicitado recuperación de contraseña');
    }

    if (new Date() > recoveryToken.expiresAt) {
      this.recoveryTokens.delete(userId);
      throw new BadRequestException('El token de recuperación ha expirado');
    }

    await this.usersService.changePassword(userId, resetPasswordDto.newPassword);
    this.recoveryTokens.delete(userId);

    await this.sessionModel.deleteMany({ userId: new Types.ObjectId(userId) });
  }

  async validateToken(token: string): Promise<UserDocument> {
    try {
      const payload = this.jwtService.verify<{ userId: string }>(token);
      return this.usersService.findById(payload.userId);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}