import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto, UpdateUserDto } from './dto/user.zod.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.user.findMany({
      include: {
        role: {
          include: { permissions: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      include: {
        role: {
          include: { permissions: true }
        }
      }
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.client.user.findUnique({
      where: { email: dto.email }
    });
    if (exists) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    return this.prisma.client.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      include: { role: true }
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.client.user.update({
      where: { id },
      data: dto as any,
      include: { role: true }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.user.delete({
      where: { id }
    });
  }
}
