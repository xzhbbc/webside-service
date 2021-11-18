import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { jwtSecret } from '@/config/constants'
import { JwtStrategy } from './jwt.strategy'

const passportModule = PassportModule.register({
  defaultStrategy: 'jwt'
  /*, session: true */
})
@Module({
  imports: [
    passportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '36000s' }
    })
  ],
  controllers: [AuthController], // 注册控制器
  providers: [AuthService, JwtStrategy],
  exports: [passportModule]
})
export class AuthModule {}
