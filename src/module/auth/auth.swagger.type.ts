import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ description: '服务名字' })
  readonly name: string
}
