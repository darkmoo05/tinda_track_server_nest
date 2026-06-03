"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const node_crypto_1 = require("node:crypto");
const prisma_service_js_1 = require("../../prisma/prisma.service.js");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    hashToken(token) {
        return (0, node_crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    async generateTokens(user) {
        const payload = { sub: user.id, username: user.username, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = (0, node_crypto_1.randomUUID)();
        const hashedRefreshToken = this.hashToken(refreshToken);
        await this.prisma.refreshToken.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });
        if (existing) {
            throw new common_1.ConflictException('Username is already taken');
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
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { username: dto.username },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordMatch = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatch) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token is required');
        }
        const hashedToken = this.hashToken(refreshToken);
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: hashedToken },
            include: { user: true },
        });
        if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
            if (tokenRecord) {
                await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } }).catch(() => { });
            }
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        await this.prisma.refreshToken.delete({
            where: { id: tokenRecord.id },
        });
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
    async logout(refreshToken) {
        if (!refreshToken) {
            return { success: true };
        }
        const hashedToken = this.hashToken(refreshToken);
        await this.prisma.refreshToken.deleteMany({
            where: { token: hashedToken },
        });
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map