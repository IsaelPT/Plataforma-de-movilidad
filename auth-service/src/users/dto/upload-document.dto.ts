import { IsEnum, IsString } from 'class-validator';
import { DocumentType } from '../../common/enums';

export class UploadDocumentDto {
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  fileUrl: string;
}