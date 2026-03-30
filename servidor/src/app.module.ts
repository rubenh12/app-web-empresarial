import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { RolesModule } from './roles/roles.module.js';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    ClientsModule, 
    ProjectsModule,
    TasksModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
