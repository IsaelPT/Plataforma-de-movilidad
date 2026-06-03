import { IsString, IsNotEmpty } from 'class-validator';

export class ContactsQueryDto {
  @IsString()
  @IsNotEmpty()
  passengerId: string;
}
