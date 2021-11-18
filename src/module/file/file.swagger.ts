import { ApiProperty } from '@nestjs/swagger'

export class FileDto {
  @ApiProperty({ description: '文件名称' })
  readonly name: string
}

export class CodeDto {
  @ApiProperty({ description: 'html' })
  readonly html: string

  @ApiProperty({ description: 'script' })
  readonly script: string

  @ApiProperty({ description: 'css' })
  readonly css: string

  @ApiProperty({ description: 'fileName' })
  readonly name: string
}
