import { IsEnum, IsString, IsOptional } from 'class-validator';
import { DocumentStatus } from '../../common/enums';

export class ReviewDocumentDto {
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}