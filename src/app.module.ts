import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from '@/module/auth/auth.module'
import { APP_FILTER } from '@nestjs/core'
import { HttpExceptionFilter } from '@/help/interceptor/http-exception.filter'
import { FileModule } from '@/module/file/file.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { getConnectionOptions } from 'typeorm'
import { ProjectModule } from '@/module/project/project.module'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          autoLoadEntities: true
        })
    }),
    AuthModule,
    FileModule,
    ProjectModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}
