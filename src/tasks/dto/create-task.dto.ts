import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { TaskStatus } from '../task-status.enum';
import { Type } from 'class-transformer';

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
  @Type(() => Date) 
  dueDate?: Date;

  @IsNumber()
  priority: number;

  @IsOptional()
  @IsUUID()
  userId: string;
}
