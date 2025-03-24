import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Task } from './tasks/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log(
          'DB_NAME trong app.module.ts:',
          configService.get('DB_DATABASE'),
        );
        console.log(
          process.env.DB_HOST,
          process.env.DB_PORT,
          process.env.DB_USERNAME,
          process.env.DB_PASSWORD,
          process.env.DB_DATABASE,
        );
        return {
          type: 'postgres',
          host:
            process.env.DB_HOST || configService.get('DB_HOST', 'localhost'),
          port:
            Number(process.env.DB_PORT) || configService.get('DB_PORT', 5432),
          username:
            process.env.DB_USERNAME ||
            configService.get('DB_USERNAME', 'postgres'),
          password:
            process.env.DB_PASSWORD ||
            configService.get('DB_PASSWORD', 'password'),
          database:
            process.env.DB_DATABASE || configService.get('DB_DATABASE', 'task'),
          entities: [User, Task],
          synchronize: configService.get('NODE_ENV') !== 'production',
        };
      },
    }),
    UsersModule,
    TasksModule,
    AuthModule,
  ],
})
export class AppModule {}
