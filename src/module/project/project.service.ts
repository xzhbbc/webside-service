/*
 * @Author: your name
 * @Date: 2021-12-15 11:21:17
 * @LastEditTime: 2021-12-20 18:02:48
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \webide-service\src\module\project\project.service.ts
 */
import { Dependencies, Injectable } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Project } from '@/entity/project.entity'
import { CreateProjectDto } from '@/module/project/project.swagger'
import { MongoRepository } from 'typeorm'
import { Service } from '@/entity/service.entity'
import { CodeHandler } from '@/utils/codeHandler'
import { join } from 'path'
import { viewProject } from '@/config/constants'
import { readdirSync, readFileSync } from 'fs'

@Injectable()
@Dependencies(getRepositoryToken(Project), getRepositoryToken(Service))
export class ProjectService {
  private projectRepository: MongoRepository<Project>
  private serviceRepository: MongoRepository<Service>
  private user = 'xzhbbc'
  constructor(projectRepository, serviceRepository) {
    this.projectRepository = projectRepository
    this.serviceRepository = serviceRepository
  }

  private async checkExistProject(name: string, msg = '已经存在该项目') {
    const getProject = await this.projectRepository.findOne({
      name: name,
      user: this.user
    })
    // console.log(getProject)
    if (getProject) {
      return {
        msg,
        code: 1,
        data: getProject
      }
    }
  }

  async createProject(body: CreateProjectDto) {
    if (!body.name) {
      return {
        msg: '请填写项目名',
        code: 1
      }
    }
    const exist = await this.checkExistProject(body.name)
    if (exist) {
      return exist
    }
    try {
      const project = new Project()
      project.name = body.name
      project.user = this.user
      project.createTime = new Date().getTime()
      project.updateTime = new Date().getTime()
      const save = await this.projectRepository.save(project)
      console.log(save)
      if (save) {
        return {
          msg: 'suc',
          data: save
        }
      } else {
        return {
          msg: 'save err'
        }
      }
    } catch (err) {
      return {
        code: 1,
        msg: `save err: ${err}`
      }
    }
  }

  async getProject() {
    const getProjectList = await this.projectRepository.find()
    return getProjectList
  }

  async checkPort() {
    const checkPort = await CodeHandler.checkPort('4000')
    return checkPort
  }

  async openService(body: CreateProjectDto) {
    if (!body.name) {
      return {
        code: 1,
        msg: '请填写开启的项目名'
      }
    }
    const exist = await this.checkExistProject(body.name)
    if (exist) {
      const findService = await this.serviceRepository.findOne({
        project: exist.data
      })
      if (findService) {
        return findService
      }
      const path = join(viewProject, body.name)
      const fileList = readdirSync(path)
      const configPath = CodeHandler.checkConfigJs(fileList)
      if (configPath) {
        const readConfig = readFileSync(join(path, configPath), 'utf-8')
        const getPort = CodeHandler.readConfigPort(readConfig)
        // TO:DO:查端口是否存在，存在修改文件中的port
        if (getPort) {
          const service = new Service()
          service.user = this.user
          service.project = exist.data
          service.createTime = new Date().getTime()
          service.port = +getPort
          const save = await this.serviceRepository.save(service)
          if (save) {
            const run = await CodeHandler.runProject(path, body.name)
            const checkPort = await CodeHandler.checkPoll(getPort)
            console.log(checkPort, 'port=====')
            if (run) {
              return save
            } else {
              return {
                msg: '开启失败',
                code: 1
              }
            }
          } else {
            return {
              msg: '开启失败',
              code: 1
            }
          }
        }
        // return CodeHandler.readConfigPort(readConfig)
      } else {
        return {
          code: 1,
          msg: '未找到配置文件'
        }
      }
    } else {
      return {
        code: 1,
        msg: '不存在该项目'
      }
    }
  }

  async killService(body: CreateProjectDto) {
    if (!body.name) {
      return {
        code: 1,
        msg: '请填写关闭的项目名'
      }
    }
    const exist = await this.checkExistProject(body.name)
    if (exist) {
      const findService = await this.serviceRepository.findOne({
        project: exist.data
      })
      if (findService) {
        const kill = await CodeHandler.killPort(`${findService.port}`)
        if (kill) {
          await this.serviceRepository.deleteOne({
            port: findService.port
          })
          return {
            msg: `成功释放端口 ${findService.port}`
          }
        } else {
          return {
            msg: `未发现系统占用端口 ${findService.port}`
          }
        }
      } else {
        return {
          code: 1,
          msg: '未找到该服务'
        }
      }
    } else {
      return {
        code: 1,
        msg: '不存在该项目'
      }
    }
  }
}
