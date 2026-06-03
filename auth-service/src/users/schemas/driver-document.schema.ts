import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DocumentType, DocumentStatus } from '../../common/enums';

export type DriverDocumentDocument = DriverDocument & Document;

@Schema({ timestamps: true, collection: 'driver_documents' })
export class DriverDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: DocumentType })
  documentType: DocumentType;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true, enum: DocumentStatus, default: DocumentStatus.PENDING, index: true })
  validationStatus: DocumentStatus;

  @Prop({ default: '' })
  rejectionReason: string;

  createdAt: Date;
  updatedAt: Date;
}

export const DriverDocumentSchema = SchemaFactory.createForClass(DriverDocument);

// Compound index for admin queries
DriverDocumentSchema.index({ userId: 1, validationStatus: 1 });
DriverDocumentSchema.index({ validationStatus: 1, createdAt: -1 });