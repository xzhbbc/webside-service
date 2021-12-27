import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Controller, Get, Query } from '@nestjs/common'
import { ProjectService } from '@/module/project/project.service'
import {
  CreateProjectDto,
  CreateScaffoldDto,
  OpenServiceDto
} from '@/module/project/project.swagger'

@ApiTags('project:新建项目')
@ApiBearerAuth()
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiResponse({ description: '录入脚手架' })
  // @UseGuards(AuthGuard())
  @Get('/createScaffold')
  async createScaffold(@Query() body: CreateScaffoldDto) {
    return this.projectService.createScaffold(body)
  }

  @ApiResponse({ description: '创建项目' })
  // @UseGuards(AuthGuard())
  @Get('/createProject')
  async createProject(@Query() body: CreateProjectDto) {
    return this.projectService.createProject(body)
  }

  @ApiResponse({ description: '获取项目' })
  @Get('/getProject')
  async getProject() {
    return this.projectService.getProject()
  }

  @ApiResponse({ description: '查询端口占用' })
  @Get('/checkPort')
  async checkPort() {
    return this.projectService.checkPort()
  }

  @ApiResponse({ description: '开启项目' })
  @Get('/openService')
  async openService(@Query() body: OpenServiceDto) {
    return this.projectService.openService(body)
  }

  @ApiResponse({ description: '关闭服务' })
  @Get('/killService')
  async killService(@Query() body: CreateProjectDto) {
    return this.projectService.killService(body)
  }

  @ApiResponse({ description: '获取脚手架' })
  @Get('/getScaffoldList')
  async getScaffoldList() {
    return this.projectService.getScaffoldList()
  }
}
