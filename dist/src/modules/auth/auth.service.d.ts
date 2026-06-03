import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    private hashToken;
    private generateTokens;
    register(dto: RegisterDto): Promise<any>;
    login(dto: LoginDto): Promise<{
        user: {
            id: any;
            username: any;
            role: any;
        };
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    refresh(refreshToken: string): Promise<{
        user: {
            id: any;
            username: any;
            role: any;
        };
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    logout(refreshToken: string): Promise<{
        success: boolean;
    }>;
}
