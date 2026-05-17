import { IsString, MinLength, MaxLength, Matches, Equals } from 'class-validator';
import { MIN_PASSWORD_LENGTH, PASSWORD_COMPLEXITY_REGEX } from '../../common/constants/app.constants';

export class ResetPasswordDto {
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(72)
  @Matches(PASSWORD_COMPLEXITY_REGEX, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;

  @IsString()
  @Equals('newPassword', { message: 'Passwords do not match' })
  confirmPassword: string;
}