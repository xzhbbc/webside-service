import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common'
import { FileService } from './file.service'
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CodeDto, FileDto } from '@/module/file/file.swagger'
@ApiTags('file:新建页面')
@ApiBearerAuth()
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiResponse({ description: 'test' })
  // @UseGuards(AuthGuard())
  @Get('/get')
  async getPreviewData(@Query() body: FileDto) {
    return this.fileService.init(body)
  }

  @ApiResponse({ description: '创建代码文件' })
  // @UseGuards(AuthGuard())
  @Get('/createFile')
  async createFile(@Query() body: FileDto) {
    return this.fileService.createFile(body)
  }

  @ApiResponse({ description: '获取代码' })
  // @UseGuards(AuthGuard())
  @Get('/getCode')
  async getCode(@Query() body: FileDto) {
    return this.fileService.getCode(body)
  }

  @ApiResponse({ description: '获取文件列表' })
  // @UseGuards(AuthGuard())
  @Get('/getFileList')
  async getFileList() {
    return this.fileService.getFileList()
  }

  @ApiResponse({ description: '设置代码' })
  @Post('/setCode')
  async setCode(@Body() body: CodeDto) {
    return this.fileService.setCode(body)
  }

  @ApiResponse({ description: '获取目录' })
  @Get('/getCatalog')
  async getCatalog() {
    return this.fileService.getCatalog()
  }
}
