import { ApiProperty } from '@nestjs/swagger'

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称' })
  readonly name: string

  @ApiProperty({ description: '框架名称 vue/react' })
  readonly modelName: string
}
