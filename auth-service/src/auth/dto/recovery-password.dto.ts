import { IsEmail } from 'class-validator';

export class RecoveryPasswordDto {
  @IsEmail()
  email: string;
}