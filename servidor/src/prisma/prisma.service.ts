import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma: InstanceType<typeof PrismaClient>;

  constructor() {
    const config = {
      url: 'file:./dev.db',
    };
    const adapter = new PrismaLibSql(config);
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get client(): InstanceType<typeof PrismaClient> {
    return this.prisma;
  }
}

