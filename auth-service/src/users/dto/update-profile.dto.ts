import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in internationally valid format (E.164)',
  })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}