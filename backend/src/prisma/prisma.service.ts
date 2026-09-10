import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma connected to database successfully.');
    } catch (error) {
      console.error('⚠️ Prisma failed to connect on module init:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
