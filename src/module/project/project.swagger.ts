import { ApiProperty } from '@nestjs/swagger'

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称' })
  readonly name: string
}
