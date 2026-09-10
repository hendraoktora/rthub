import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '081234567890', description: 'Nomor WhatsApp atau Email terdaftar' })
  @IsString()
  @IsNotEmpty()
  username: string; // Bisa Phone atau Email

  @ApiProperty({ example: 'Password123!', description: 'Kata sandi' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
