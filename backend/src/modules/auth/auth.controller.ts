import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { DocumentVerificationService } from './document-verification.service';
import { RegisterRtDto } from './dto/register-rt.dto';
import { RegisterWargaDto } from './dto/register-warga.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth (Autentikasi, Registrasi, Dokumen AI & OTP)')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly documentVerificationService: DocumentVerificationService,
  ) {}

  @Post('send-otp')
  @ApiOperation({
    summary: 'Kirim Kode OTP (WhatsApp / Email)',
    description: 'Mengirimkan kode OTP 6 digit untuk verifikasi pendaftaran akun.',
  })
  async sendOtp(@Body() body: { target: string; channel?: 'WHATSAPP' | 'EMAIL'; purpose?: string }) {
    return this.otpService.sendOtp(body.target, body.channel, body.purpose);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verifikasi Kode OTP',
    description: 'Memverifikasi kode OTP yang dimasukkan pengguna.',
  })
  async verifyOtp(@Body() body: { target: string; code: string }) {
    const isValid = await this.otpService.verifyOtp(body.target, body.code);
    return { success: isValid, message: 'Kode OTP valid dan terverifikasi.' };
  }

  @Post('verify-document')
  @ApiOperation({
    summary: 'Verifikasi Forensik AI & Validasi Data Dokumen SK RT',
    description: 'Memeriksa keaslian dokumen SK RT dari generator AI/manipulasi dan mencocokkan data NIK, Nama, dan Wilayah.',
  })
  async verifyDocument(
    @Body()
    body: {
      documentBase64: string;
      nik: string;
      namaLengkap: string;
      nomorRt: string;
      nomorRw: string;
      namaKelurahan: string;
    },
  ) {
    return this.documentVerificationService.verifyDocument(body);
  }

  @Post('register-rt')
  @ApiOperation({
    summary: 'Registrasi Mandiri RT (Bottom-Up Auto Grouping)',
    description: 'Ketua/Admin RT mendaftarkan RT baru. RW & Kelurahan otomatis digabungkan jika sudah pernah didaftarkan oleh RT lain.',
  })
  @ApiResponse({ status: 201, description: 'RT dan Akun Admin berhasil dibuat.' })
  async registerRT(@Body() dto: RegisterRtDto) {
    return this.authService.registerRT(dto);
  }

  @Post('register-warga')
  @ApiOperation({
    summary: 'Registrasi Akun Warga',
    description: 'Warga mendaftar dengan memilih RT tempat tinggal.',
  })
  @ApiResponse({ status: 201, description: 'Akun Warga berhasil dibuat.' })
  async registerWarga(@Body() dto: RegisterWargaDto) {
    return this.authService.registerWarga(dto);
  }

  @Get('list-rt')
  @ApiOperation({
    summary: 'Daftar Semua RT Terdaftar (Publik untuk Pendaftaran Warga)',
    description: 'Menampilkan daftar RT beserta RW dan Kelurahan untuk dipilih calon warga baru.',
  })
  @ApiResponse({ status: 200, description: 'Daftar RT berhasil diambil.' })
  async listPublicRt() {
    return this.authService.listPublicRt();
  }

  @Get('check-nik/:nik')
  @ApiOperation({
    summary: 'Cek Ketersediaan NIK (Anti Duplikasi)',
    description: 'Memeriksa apakah NIK sudah digunakan oleh akun lain di sistem.',
  })
  @ApiResponse({ status: 200, description: 'Status ketersediaan NIK.' })
  async checkNik(@Param('nik') nik: string) {
    return this.authService.checkNikAvailable(nik);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login Warga / Pengurus RT / RW / Superadmin',
    description: 'Login menggunakan nomor WhatsApp/Email dan kata sandi untuk mendapatkan JWT Token.',
  })
  @ApiResponse({ status: 200, description: 'Login berhasil.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mendapatkan profil pengguna saat ini' })
  async getProfile(@CurrentUser() user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profil pengguna dan foto profil' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: {
      namaLengkap?: string;
      phone?: string;
      email?: string;
      noRumah?: string;
      nik?: string;
      noKk?: string;
      avatarUrl?: string;
    },
  ) {
    return this.authService.updateProfile(user.id, dto);
  }
}
