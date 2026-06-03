import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RecoveryPasswordDto } from './dto/recovery-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

interface ResetPasswordBody {
  userId: string;
  resetPasswordDto: ResetPasswordDto;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    return {
      message: 'Usuario registrado exitosamente',
      user: {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('recovery')
  @HttpCode(HttpStatus.OK)
  async recoverPassword(@Body() recoveryPasswordDto: RecoveryPasswordDto) {
    await this.authService.recoverPassword(recoveryPasswordDto);
    // Security: Always return same message regardless of email existence
    return {
      message: 'Si el correo existe, se ha enviado un enlace de recuperación',
    };
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordBody) {
    const { userId, resetPasswordDto } = body;
    
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    
    await this.authService.resetPassword(userId, resetPasswordDto);
    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }
}