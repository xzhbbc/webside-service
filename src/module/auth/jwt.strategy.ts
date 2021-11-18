import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { jwtSecret, serviceLogName } from '@/config/constants'
import Utils from '@/utils/utils'
import { LoginDto } from '@/module/auth/auth.swagger.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret
    })
  }

  async validate(data: LoginDto) {
    const md5 = Utils.md5Encode(serviceLogName)
    if (!data.name) {
      throw new UnauthorizedException()
    }
    if (md5 != data.name) {
      throw new UnauthorizedException()
    }
    return data
  }
}
