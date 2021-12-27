import { ApiProperty } from '@nestjs/swagger'

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称' })
  readonly name: string

  @ApiProperty({ description: '脚手架' })
  readonly scaffoldId: string
}

export class CreateScaffoldDto {
  @ApiProperty({ description: '框架语言，如vue,react', required: false })
  readonly modelName: string

  @ApiProperty({ description: '所用的脚手架名称' })
  readonly scaffoldName: string

  @ApiProperty({ description: '脚手架所引用的模板文件名称 在cache文件夹下的' })
  readonly fileModelName: string
}

export class OpenServiceDto {
  @ApiProperty({ description: '项目名称' })
  readonly name: string
}
