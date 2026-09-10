import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterRtDto } from './dto/register-rt.dto';
import { RegisterWargaDto } from './dto/register-warga.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    registerRT(dto: RegisterRtDto): Promise<{
        message: string;
        autoGrouped: {
            kelurahan: string;
            rw: string;
            rt: string;
            isExistingRw: boolean;
        };
        user: any;
        accessToken: string;
    }>;
    registerWarga(dto: RegisterWargaDto): Promise<{
        message: string;
        user: any;
        accessToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        user: any;
        accessToken: string;
    }>;
    updateProfile(userId: string, data: {
        namaLengkap?: string;
        phone?: string;
        email?: string;
        noRumah?: string;
        nik?: string;
        noKk?: string;
        avatarUrl?: string;
    }): Promise<{
        message: string;
        user: any;
    }>;
    listPublicRt(): Promise<{
        id: string;
        nomorRt: string;
        nomorRw: string;
        namaKelurahan: string;
        kecamatan: string;
        kota: string;
        namaJalan: string;
        label: string;
    }[]>;
    checkNikAvailable(nik: string, excludeUserId?: string): Promise<{
        available: boolean;
        valid: boolean;
        message: string;
    }>;
    private generateToken;
    private sanitizeUser;
}
