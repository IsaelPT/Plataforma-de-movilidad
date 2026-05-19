import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { DriverDocument, DriverDocumentDocument } from './schemas/driver-document.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UserRole, UserStatus, DocumentStatus } from '../common/enums';
import { BCRYPT_ROUNDS } from '../common/constants/app.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DriverDocument.name) private documentModel: Model<DriverDocumentDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, BCRYPT_ROUNDS);

    const user = new this.userModel({
      email: createUserDto.email,
      passwordHash,
      role: createUserDto.role,
      profile: {
        firstName: createUserDto.firstName || '',
        lastName: createUserDto.lastName || '',
        phoneNumber: createUserDto.phoneNumber || '',
        photoUrl: '',
      },
      isVerified: false,
      status: UserStatus.ACTIVE,
      isAvailable: false,
      documents: [],
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserDocument> {
    const user = await this.findById(userId);

    if (updateProfileDto.firstName !== undefined) {
      user.profile.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName !== undefined) {
      user.profile.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.phoneNumber !== undefined) {
      user.profile.phoneNumber = updateProfileDto.phoneNumber;
    }
    if (updateProfileDto.photoUrl !== undefined) {
      user.profile.photoUrl = updateProfileDto.photoUrl;
    }

    return user.save();
  }

  async uploadDocument(userId: string, uploadDocumentDto: UploadDocumentDto): Promise<DriverDocumentDocument> {
    const user = await this.findById(userId);

    if (user.role !== UserRole.DRIVER) {
      throw new BadRequestException('Solo los conductores pueden subir documentos');
    }

    const document = new this.documentModel({
      userId: new Types.ObjectId(userId),
      documentType: uploadDocumentDto.documentType,
      fileUrl: uploadDocumentDto.fileUrl,
      validationStatus: DocumentStatus.PENDING,
      rejectionReason: '',
    });

    const savedDocument = await document.save();

    await this.userModel.findByIdAndUpdate(userId, {
      $push: { documents: savedDocument._id },
    });

    return savedDocument;
  }

  async getDocuments(userId: string): Promise<DriverDocumentDocument[]> {
    return this.documentModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async setDriverAvailability(userId: string, isAvailable: boolean): Promise<UserDocument> {
    const user = await this.findById(userId);

    if (user.role !== UserRole.DRIVER) {
      throw new BadRequestException('Solo los conductores pueden cambiar su disponibilidad');
    }

    user.isAvailable = isAvailable;
    return user.save();
  }

  async getDriverAvailability(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user.isAvailable;
  }

  async verifyUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { isVerified: true, status: UserStatus.VERIFIED },
      { new: true },
    ).exec();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.userModel.findByIdAndUpdate(userId, { passwordHash });
  }
}