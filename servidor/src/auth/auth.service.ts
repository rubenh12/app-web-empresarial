import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: any) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
      include: {
        role: {
          include: { permissions: true }
        }
      }
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Credenciales inválidas');

    const permissions = user.role.permissions.map(p => p.slug);
    const tokens = await this.getTokens(user.id, user.email, user.role.name, permissions);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        permissions
      },
      ...tokens
    };
  }

  async logout(userId: string) {
    await this.prisma.client.user.updateMany({
      where: {
        id: userId,
        refreshToken: { not: null },
      },
      data: { refreshToken: null },
    });
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { permissions: true }
        }
      }
    });
    if (!user || !user.refreshToken) throw new ForbiddenException('Acceso denegado');

    const rtMatches = await bcrypt.compare(rt, user.refreshToken);
    if (!rtMatches) throw new ForbiddenException('Acceso denegado');

    const permissions = user.role.permissions.map(p => p.slug);
    const tokens = await this.getTokens(user.id, user.email, user.role.name, permissions);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRefreshToken(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }

  async getTokens(userId: string, email: string, role: string, permissions: string[]) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role, permissions },
        { secret: process.env.JWT_SECRET || 'at-secret', expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_REFRESH_SECRET || 'rt-secret', expiresIn: '7d' },
      ),
    ]);

    return { access_token: at, refresh_token: rt };
  }
}
