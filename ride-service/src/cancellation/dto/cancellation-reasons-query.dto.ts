import { IsOptional, IsIn } from 'class-validator';

export class CancellationReasonsQueryDto {
  @IsOptional()
  @IsIn(['driver', 'passenger'])
  role?: string;
}
