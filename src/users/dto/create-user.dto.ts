import { IsString, IsEmail, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Vai trò là bắt buộc' })
  role: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
