import { Controller, Post, Body, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './decorators/public.decorator.js';
import { GetUser } from './decorators/get-user.decorator.js';

@Throttle({ auth: { limit: 10, ttl: 60000 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  async me(@GetUser() user: any) {
    return { success: true, user };
  }

  @Public()
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Public()
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}

