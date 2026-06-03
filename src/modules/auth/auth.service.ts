import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID, createHash } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(user: { id: string; username: string; role: any }) {
    const payload = { sub: user.id, username: user.username, role: user.role };
    
    // Access token valid for 15 minutes
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    // Secure random refresh token
    const refreshToken = randomUUID();
    const hashedRefreshToken = this.hashToken(refreshToken);

    // Save hashed refresh token to the database
    await this.prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: dto.role,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const hashedToken = this.hashToken(refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      // Clean up if expired/invalid record exists
      if (tokenRecord) {
        await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } }).catch(() => {});
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old refresh token (Token Rotation)
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    // Generate new access and refresh tokens
    const tokens = await this.generateTokens(tokenRecord.user);
    return {
      ...tokens,
      user: {
        id: tokenRecord.user.id,
        username: tokenRecord.user.username,
        role: tokenRecord.user.role,
      },
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      return { success: true };
    }
    const hashedToken = this.hashToken(refreshToken);
    await this.prisma.refreshToken.deleteMany({
      where: { token: hashedToken },
    });
    return { success: true };
  }
}

