import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsNumber()
  priority: number;

  @IsOptional()
  @IsUUID()
  userId: string;
}
