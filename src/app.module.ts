import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BoardsModule } from './modules/boards/boards.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, BoardsModule, ColumnsModule, TasksModule,
    ThrottlerModule.forRoot([{
      ttl: 60000, 
      limit: 7,
    }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
