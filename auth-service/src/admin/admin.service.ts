import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { DriverDocument, DriverDocumentDocument } from '../users/schemas/driver-document.schema';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { DocumentStatus, UserStatus, UserRole } from '../common/enums';

export interface DriverWithDocuments {
  user: UserDocument;
  documents: DriverDocumentDocument[];
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DriverDocument.name) private documentModel: Model<DriverDocumentDocument>,
  ) {}

  async getAllPendingDrivers(): Promise<DriverWithDocuments[]> {
    const pendingDocuments = await this.documentModel
      .find({ validationStatus: DocumentStatus.PENDING })
      .populate('userId')
      .exec();

    const driverMap = new Map<string, DriverWithDocuments>();

    for (const doc of pendingDocuments) {
      const userId = (doc.userId as unknown as { _id: Types.ObjectId })._id.toString();
      
      if (!driverMap.has(userId)) {
        driverMap.set(userId, {
          user: doc.userId as unknown as UserDocument,
          documents: [],
        });
      }
      
      driverMap.get(userId)!.documents.push(doc);
    }

    return Array.from(driverMap.values());
  }

  async getPendingDocuments(): Promise<DriverDocumentDocument[]> {
    return this.documentModel
      .find({ validationStatus: DocumentStatus.PENDING })
      .populate('userId', 'email profile')
      .exec();
  }

  async reviewDocument(
    documentId: string, 
    reviewDto: ReviewDocumentDto,
    session?: ClientSession,
  ): Promise<DriverDocumentDocument> {
    const document = await this.documentModel.findById(documentId).session(session ?? null).exec();
    
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    document.validationStatus = reviewDto.status;
    
    if (reviewDto.status === DocumentStatus.REJECTED && reviewDto.rejectionReason) {
      document.rejectionReason = reviewDto.rejectionReason;
    }

    await document.save({ session: session ?? undefined });

    await this.checkAndUpdateDriverVerification(document.userId.toString(), session);

    return document;
  }

  private async checkAndUpdateDriverVerification(
    userId: string, 
    session?: ClientSession,
  ): Promise<void> {
    const allDocuments = await this.documentModel.find({
      userId: new Types.ObjectId(userId),
    }).session(session ?? null).exec();

    const allApproved = allDocuments.every(
      (doc) => doc.validationStatus === DocumentStatus.APPROVED,
    );

    if (allApproved) {
      await this.userModel.findByIdAndUpdate(
        userId,
        { isVerified: true, status: UserStatus.VERIFIED },
      ).session(session ?? null).exec();
    }
  }

  async getAllDrivers(): Promise<UserDocument[]> {
    return this.userModel.find({ role: UserRole.DRIVER }).exec();
  }

  async getDriverDetails(driverId: string): Promise<DriverWithDocuments> {
    const user = await this.userModel.findById(driverId).exec();
    
    if (!user || user.role !== UserRole.DRIVER) {
      throw new NotFoundException('Conductor no encontrado');
    }

    const documents = await this.documentModel.find({ userId: new Types.ObjectId(driverId) }).exec();

    return { user, documents };
  }
}