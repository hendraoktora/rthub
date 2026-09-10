import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterWargaDto {
  @ApiProperty({ example: 'Bpk. Budi Santoso', description: 'Nama lengkap warga' })
  @IsString()
  @IsNotEmpty()
  namaLengkap: string;

  @ApiProperty({ example: '089876543210', description: 'Nomor WhatsApp aktif' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'budi@gmail.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Password123!', description: 'Kata sandi akun' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'rt-uuid-string', description: 'ID RT tempat tinggal' })
  @IsString()
  @IsNotEmpty()
  rtId: string;

  @ApiProperty({ example: 'Blok C3 No. 12', description: 'Nomor rumah / blok' })
  @IsString()
  @IsNotEmpty()
  noRumah: string;

  @ApiPropertyOptional({ example: '3276012345678901', description: 'Nomor KK' })
  @IsOptional()
  @IsString()
  noKk?: string;

  @ApiPropertyOptional({ example: '3276011111111111', description: 'NIK' })
  @IsOptional()
  @IsString()
  nik?: string;
}
