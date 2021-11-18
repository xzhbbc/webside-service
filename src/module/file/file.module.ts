import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtModule } from '@nestjs/jwt'
import { jwtSecret } from '@/config/constants'
import { FileService } from '@/module/file/file.service'
import { FileController } from '@/module/file/file.controller'

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: jwtSecret
    })
  ],
  controllers: [FileController],
  providers: [FileService]
})
export class FileModule {}
