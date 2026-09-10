import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterRtDto {
  @ApiProperty({ example: 'Bpk. Hendra Gunawan', description: 'Nama lengkap Ketua / Admin RT' })
  @IsString()
  @IsNotEmpty()
  namaLengkap: string;

  @ApiPropertyOptional({ example: '3276010101800001', description: '16 digit NIK KTP' })
  @IsOptional()
  @IsString()
  nik?: string;

  @ApiProperty({ example: '081234567890', description: 'Nomor WhatsApp aktif' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'rt03@rthub.id', description: 'Email opsional' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Password123!', description: 'Kata sandi akun RT' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '03', description: 'Nomor RT (e.g. 01, 03)' })
  @IsString()
  @IsNotEmpty()
  nomorRt: string;

  @ApiProperty({ example: '05', description: 'Nomor RW (e.g. 01, 05)' })
  @IsString()
  @IsNotEmpty()
  nomorRw: string;

  @ApiProperty({ example: 'Sukamaju', description: 'Nama Kelurahan / Desa' })
  @IsString()
  @IsNotEmpty()
  namaKelurahan: string;

  @ApiPropertyOptional({ example: 'Cilodong', description: 'Kecamatan' })
  @IsOptional()
  @IsString()
  kecamatan?: string;

  @ApiPropertyOptional({ example: 'Depok', description: 'Kota / Kabupaten' })
  @IsOptional()
  @IsString()
  kota?: string;

  @ApiPropertyOptional({ example: 'Jl. Melati Raya Blok C', description: 'Nama Jalan / Gang Utama RT' })
  @IsOptional()
  @IsString()
  namaJalan?: string;

  @ApiPropertyOptional({ description: 'URL / Base64 Foto Dokumen SK Pengangkatan / Legalitas RT' })
  @IsOptional()
  @IsString()
  skDokumenUrl?: string;
}
