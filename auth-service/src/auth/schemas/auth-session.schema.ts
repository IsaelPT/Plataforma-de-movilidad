import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuthSessionDocument = AuthSession & Document;

@Schema({ timestamps: true, collection: 'auth_sessions' })
export class AuthSession {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  tokenHash: string;

  @Prop({ default: 'Unknown' })
  deviceName: string;

  @Prop({ default: 'Unknown' })
  ipAddress: string;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);

// Index for session cleanup queries
AuthSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup