import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { LoginDto } from '@/module/auth/auth.swagger.type'
import { serviceLogName } from '@/config/constants'
import Utils from '@/utils/utils'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(service: LoginDto) {
    if (service.name !== serviceLogName) {
      return {
        msg: '服务名字不正确'
      }
    }
    const payload = {
      name: Utils.md5Encode(service.name)
    }
    return {
      token: 'Bearer ' + this.jwtService.sign(payload)
    }
  }
}
