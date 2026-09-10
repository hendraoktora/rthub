import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterRtDto } from './dto/register-rt.dto';
import { RegisterWargaDto } from './dto/register-warga.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * ALGORITMA BOTTOM-UP SELF-SERVICE ONBOARDING RT (FIND-OR-CREATE AUTO GROUPING)
   */
  async registerRT(dto: RegisterRtDto) {
    // 1. Cek apakah nomor phone/whatsapp sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existingUser) {
      throw new ConflictException('Nomor WhatsApp sudah terdaftar.');
    }

    // 1b. Cek duplikasi NIK (Tidak boleh ada NIK kembar terdaftar)
    if (dto.nik && dto.nik.trim().length === 16) {
      const cleanNik = dto.nik.trim();
      const existingNik = await this.prisma.profile.findFirst({
        where: { nik: cleanNik },
      });
      if (existingNik) {
        throw new BadRequestException(`NIK ${cleanNik} sudah terdaftar dalam sistem. Tidak boleh menggunakan NIK yang sama.`);
      }
    }

    // 2. Normalisasi string
    const namaKelurahan = dto.namaKelurahan.trim();
    const nomorRw = dto.nomorRw.trim();
    const nomorRt = dto.nomorRt.trim();

    // 3. Find or Create Kelurahan
    let kelurahan = await this.prisma.kelurahan.findFirst({
      where: {
        nama: { equals: namaKelurahan },
        ...(dto.kecamatan ? { kecamatan: { equals: dto.kecamatan.trim() } } : {}),
      },
    });

    if (!kelurahan) {
      kelurahan = await this.prisma.kelurahan.create({
        data: {
          nama: namaKelurahan,
          kecamatan: dto.kecamatan?.trim() || null,
          kota: dto.kota?.trim() || null,
        },
      });
    }

    // 4. Find or Create RW di bawah Kelurahan ini
    let rw = await this.prisma.rW.findFirst({
      where: {
        nomor: nomorRw,
        kelurahanId: kelurahan.id,
      },
    });

    if (!rw) {
      rw = await this.prisma.rW.create({
        data: {
          nomor: nomorRw,
          kelurahanId: kelurahan.id,
        },
      });
    }

    // 5. Cek apakah RT sudah ada di bawah RW ini
    let rt = await this.prisma.rT.findFirst({
      where: {
        nomor: nomorRt,
        rwId: rw.id,
      },
    });

    if (rt) {
      // Cek apakah RT ini sudah memiliki Ketua/Admin aktif
      const existingAdmin = await this.prisma.user.findFirst({
        where: {
          rtId: rt.id,
          role: Role.ADMIN_RT,
          isActive: true,
        },
      });
      if (existingAdmin) {
        throw new ConflictException(`RT ${nomorRt} di RW ${nomorRw} Kel. ${namaKelurahan} sudah terdaftar dengan Admin aktif.`);
      }
    } else {
      // Buat RT baru
      rt = await this.prisma.rT.create({
        data: {
          nomor: nomorRt,
          namaJalan: dto.namaJalan?.trim() || null,
          skDokumenUrl: dto.skDokumenUrl || null,
          rwId: rw.id,
        },
      });
    }

    // 6. Buat Master Tagihan Default untuk RT ini
    await this.prisma.masterTagihan.createMany({
      data: [
        {
          rtId: rt.id,
          namaTagihan: 'Iuran Kas & Kebersihan Lingkungan',
          nominalPokok: 50000.00,
          adminFee: 2000.00,
          deskripsi: 'Iuran kas operasional RT dan pengelolaan sampah bulanan',
        },
      ],
      skipDuplicates: true,
    });

    // 7. Hash Password & Buat User Admin RT
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email || null,
        passwordHash,
        role: Role.ADMIN_RT,
        kelurahanId: kelurahan.id,
        rwId: rw.id,
        rtId: rt.id,
        profile: {
          create: {
            namaLengkap: dto.namaLengkap,
            nik: dto.nik?.trim() || null,
            skDokumenUrl: dto.skDokumenUrl || null,
          },
        },
      },
      include: {
        profile: true,
        rt: true,
        rw: true,
        kelurahan: true,
      },
    });

    const token = this.generateToken(user.id, user.phone, user.role);

    return {
      message: 'Pendaftaran RT dan Akun Admin RT berhasil!',
      autoGrouped: {
        kelurahan: kelurahan.nama,
        rw: rw.nomor,
        rt: rt.nomor,
        isExistingRw: Boolean(rw),
      },
      user: this.sanitizeUser(user),
      accessToken: token,
    };
  }

  /**
   * PENDAFTARAN WARGA
   */
  async registerWarga(dto: RegisterWargaDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existingUser) {
      throw new ConflictException('Nomor WhatsApp sudah terdaftar.');
    }

    // Cek duplikasi NIK warga
    if (dto.nik && dto.nik.trim().length === 16) {
      const cleanNik = dto.nik.trim();
      const existingNik = await this.prisma.profile.findFirst({
        where: { nik: cleanNik },
      });
      if (existingNik) {
        throw new BadRequestException(`NIK ${cleanNik} sudah terdaftar dalam sistem. Tidak boleh menggunakan NIK yang sama.`);
      }
    }

    const rt = await this.prisma.rT.findUnique({
      where: { id: dto.rtId },
      include: { rw: { include: { kelurahan: true } } },
    });
    if (!rt) {
      throw new BadRequestException('RT yang dipilih tidak ditemukan.');
    }

    // Find or create Rumah
    let rumah = await this.prisma.rumah.findFirst({
      where: {
        rtId: rt.id,
        noRumah: dto.noRumah.trim(),
      },
    });

    if (!rumah) {
      rumah = await this.prisma.rumah.create({
        data: {
          rtId: rt.id,
          noRumah: dto.noRumah.trim(),
          alamatLengkap: `${dto.noRumah.trim()}, RT ${rt.nomor}/RW ${rt.rw.nomor}`,
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email || null,
        passwordHash,
        role: Role.WARGA,
        rtId: rt.id,
        rwId: rt.rwId,
        kelurahanId: rt.rw.kelurahanId,
        profile: {
          create: {
            namaLengkap: dto.namaLengkap,
            noRumah: dto.noRumah.trim(),
            nik: dto.nik?.trim() || null,
            noKk: dto.noKk?.trim() || null,
          },
        },
      },
      include: {
        profile: true,
        rt: true,
        rw: true,
        kelurahan: true,
      },
    });

    const token = this.generateToken(user.id, user.phone, user.role);

    return {
      message: 'Pendaftaran Warga berhasil!',
      user: this.sanitizeUser(user),
      accessToken: token,
    };
  }

  /**
   * LOGIN (WARGA / PENGURUS / SUPERADMIN)
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: dto.username }, { email: dto.username }],
      },
      include: {
        profile: true,
        rt: true,
        rw: true,
        kelurahan: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Nomor WhatsApp/Email atau kata sandi salah.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Nomor WhatsApp/Email atau kata sandi salah.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun Anda dinonaktifkan. Silakan hubungi Pengurus RT.');
    }

    const token = this.generateToken(user.id, user.phone, user.role);

    return {
      message: 'Login berhasil!',
      user: this.sanitizeUser(user),
      accessToken: token,
    };
  }

  async updateProfile(userId: string, data: {
    namaLengkap?: string;
    phone?: string;
    email?: string;
    noRumah?: string;
    nik?: string;
    noKk?: string;
    avatarUrl?: string;
  }) {
    if (data.phone) {
      const existing = await this.prisma.user.findFirst({
        where: {
          phone: data.phone.trim(),
          NOT: { id: userId },
        },
      });
      if (existing) {
        throw new ConflictException('Nomor WhatsApp sudah digunakan oleh akun lain.');
      }
    }

    // Cek duplikasi NIK jika diupdate
    if (data.nik && data.nik.trim().length === 16) {
      const cleanNik = data.nik.trim();
      const existingNik = await this.prisma.profile.findFirst({
        where: {
          nik: cleanNik,
          userId: { not: userId },
        },
      });
      if (existingNik) {
        throw new BadRequestException(`NIK ${cleanNik} sudah digunakan oleh akun lain.`);
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.phone ? { phone: data.phone.trim() } : {}),
        ...(data.email !== undefined ? { email: data.email?.trim() || null } : {}),
        profile: {
          upsert: {
            create: {
              namaLengkap: data.namaLengkap?.trim() || 'Warga RT',
              noRumah: data.noRumah?.trim() || null,
              nik: data.nik?.trim() || null,
              noKk: data.noKk?.trim() || null,
              avatarUrl: data.avatarUrl || null,
            },
            update: {
              ...(data.namaLengkap ? { namaLengkap: data.namaLengkap.trim() } : {}),
              ...(data.noRumah !== undefined ? { noRumah: data.noRumah?.trim() || null } : {}),
              ...(data.nik !== undefined ? { nik: data.nik?.trim() || null } : {}),
              ...(data.noKk !== undefined ? { noKk: data.noKk?.trim() || null } : {}),
              ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
            },
          },
        },
      },
      include: {
        profile: true,
        rt: true,
        rw: true,
        kelurahan: true,
      },
    });

    return {
      message: 'Profil berhasil diperbarui di database!',
      user: this.sanitizeUser(user),
    };
  }

  async listPublicRt() {
    const rts = await this.prisma.rT.findMany({
      include: {
        rw: {
          include: {
            kelurahan: true,
          },
        },
      },
      orderBy: [
        { rw: { kelurahan: { nama: 'asc' } } },
        { rw: { nomor: 'asc' } },
        { nomor: 'asc' },
      ],
    });

    return rts.map((rt) => ({
      id: rt.id,
      nomorRt: rt.nomor,
      nomorRw: rt.rw.nomor,
      namaKelurahan: rt.rw.kelurahan.nama,
      kecamatan: rt.rw.kelurahan.kecamatan,
      kota: rt.rw.kelurahan.kota,
      namaJalan: rt.namaJalan,
      label: `RT ${rt.nomor} / RW ${rt.rw.nomor} - Kel. ${rt.rw.kelurahan.nama} (${rt.rw.kelurahan.kota ?? ''})`,
    }));
  }

  async checkNikAvailable(nik: string, excludeUserId?: string) {
    const cleanNik = nik.replace(/[^0-9]/g, '');
    if (cleanNik.length !== 16) {
      return { available: true, valid: false, message: 'Panjang NIK harus 16 digit' };
    }
    const existing = await this.prisma.profile.findFirst({
      where: {
        nik: cleanNik,
        ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
      },
      include: {
        user: { select: { phone: true, role: true } },
      },
    });
    if (existing) {
      return {
        available: false,
        valid: true,
        message: `NIK ${cleanNik} sudah terdaftar dalam sistem (Role: ${existing.user?.role ?? 'User'}).`,
      };
    }
    return {
      available: true,
      valid: true,
      message: 'NIK valid & tersedia untuk pendaftaran.',
    };
  }

  private generateToken(userId: string, phone: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, phone, role },
      {
        secret: process.env.JWT_SECRET || 'rthub-super-secret-jwt-key-2026-production',
        expiresIn: '7d',
      },
    );
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
