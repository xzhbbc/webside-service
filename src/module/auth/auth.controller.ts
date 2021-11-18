import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { LoginDto } from '@/module/auth/auth.swagger.type'
@ApiTags('auth:认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(AuthGuard('encry'))
  @ApiResponse({ description: '注册token' })
  @Post('/signToken')
  async signToken(@Body() body: LoginDto) {
    return this.authService.signToken(body)
  }
}
