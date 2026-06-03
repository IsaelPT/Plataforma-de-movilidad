import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole, UserStatus } from '../../common/enums';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class Profile {
  @Prop({ required: true, default: '' })
  firstName: string;

  @Prop({ required: true, default: '' })
  lastName: string;

  @Prop({ required: true, default: '' })
  phoneNumber: string;

  @Prop({ default: '' })
  photoUrl: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CLIENT, index: true })
  role: UserRole;

  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.ACTIVE, index: true })
  status: UserStatus;

  @Prop({ type: ProfileSchema, default: () => ({}) })
  profile: Profile;

  @Prop({ required: true, default: false, index: true })
  isAvailable: boolean;

  @Prop({ type: Types.ObjectId, ref: 'DriverDocument' })
  documents: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Compound index for common queries
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, status: 1 });