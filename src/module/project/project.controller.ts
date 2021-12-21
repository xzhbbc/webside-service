/*
 * @Author: your name
 * @Date: 2021-12-15 11:21:27
 * @LastEditTime: 2021-12-20 16:47:31
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \webide-service\src\module\project\project.controller.ts
 */
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Controller, Get, Query } from '@nestjs/common'
import { ProjectService } from '@/module/project/project.service'
import { CreateProjectDto } from '@/module/project/project.swagger'

@ApiTags('project:新建项目')
@ApiBearerAuth()
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

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
  async openService(@Query() body: CreateProjectDto) {
    return this.projectService.openService(body)
  }

  @ApiResponse({ description: '关闭服务' })
  @Get('/killService')
  async killService(@Query() body: CreateProjectDto) {
    return this.projectService.killService(body)
  }
}
