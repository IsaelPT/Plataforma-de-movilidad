import { IsString, IsNumber, IsOptional, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterContactDto {
  @IsString()
  passengerId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be in international format (e.g. +1234567890)',
  })
  phone: string;
}
