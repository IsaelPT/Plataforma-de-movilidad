import { IsString } from 'class-validator';

export class RegisterDriverDto {
  @IsString()
  userId: string;
}
