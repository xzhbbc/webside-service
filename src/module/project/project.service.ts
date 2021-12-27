/*
 * @Author: your name
 * @Date: 2021-12-15 11:21:17
 * @LastEditTime: 2021-12-27 10:59:33
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \webide-service\src\module\project\project.service.ts
 */
import { Dependencies, Injectable } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Project } from '@/entity/project.entity'
import {
  CreateProjectDto,
  CreateScaffoldDto,
  OpenServiceDto
} from '@/module/project/project.swagger'
import { MongoRepository } from 'typeorm'
import { Service } from '@/entity/service.entity'
import { CodeHandler } from '@/utils/codeHandler'
import { join } from 'path'
import { cacheProject, viewProject } from '@/config/constants'
import { readdirSync } from 'fs'
import { Scaffold } from '@/entity/scaffold.entity'
import {
  copySync,
  readJsonSync,
  writeJsonSync,
  readFileSync,
  writeFileSync
} from 'fs-extra'

@Injectable()
@Dependencies(
  getRepositoryToken(Project),
  getRepositoryToken(Service),
  getRepositoryToken(Scaffold)
)
export class ProjectService {
  private projectRepository: MongoRepository<Project>
  private serviceRepository: MongoRepository<Service>
  private scaffoldRepository: MongoRepository<Scaffold>
  private user = 'xzhbbc'
  constructor(projectRepository, serviceRepository, scaffoldRepository) {
    this.projectRepository = projectRepository
    this.serviceRepository = serviceRepository
    this.scaffoldRepository = scaffoldRepository
  }

  private judgeSaveBackRes(save: any) {
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

  async getScaffoldList() {
    return await this.scaffoldRepository.find()
  }

  async createScaffold(body: CreateScaffoldDto) {
    // TO:DO 检验传进来的cmd，判断系统是否存在该脚手架命令
    if (!body.modelName || !body.fileModelName || !body.scaffoldName) {
      return {
        code: 1,
        msg: '请正确传参！'
      }
    }
    const scaffold = new Scaffold()
    scaffold.modelName = body.modelName
    scaffold.scaffoldName = body.scaffoldName
    scaffold.fileModelName = body.fileModelName
    // scaffold.cmd = body.cmd
    // scaffold.isMore = body.isMore
    const save = await this.scaffoldRepository.save(scaffold)
    return this.judgeSaveBackRes(save)
  }

  async createProject(body: CreateProjectDto) {
    if (!body.name) {
      return {
        msg: '请填写项目名',
        code: 1
      }
    }
    if (!body.scaffoldId) {
      return {
        msg: '请传脚手架id',
        code: 1
      }
    }
    try {
      const exist = await this.checkExistProject(body.name)
      if (exist) {
        return exist
      }
      const getScaffold = await this.scaffoldRepository.findOne(body.scaffoldId)
      const viewPath = join(viewProject, body.name)
      copySync(join(cacheProject, getScaffold.fileModelName), viewPath)
      const readPackageJsonPath = join(viewPath, './package.json')
      const readPackageJson = readFileSync(readPackageJsonPath, {
        encoding: 'utf-8'
      })
      const pattern = /(?<="name": ).*?(?=,)/g
      // readPackageJson.name = body.name
      writeFileSync(
        readPackageJsonPath,
        readPackageJson.replace(pattern, `"${body.name}"`)
      )
      const project = new Project()
      project.name = body.name
      project.scaffold = getScaffold
      // project.modelName = body.modelName
      project.user = this.user
      project.createTime = new Date().getTime()
      project.updateTime = new Date().getTime()
      const save = await this.projectRepository.save(project)
      console.log(save)
      return this.judgeSaveBackRes(save)
    } catch (err) {
      return {
        code: 1,
        msg: `save err: ${err}`
      }
    }
  }

  async getProject() {
    const getProjectList = await this.projectRepository.find({
      relations: ['scaffold']
    })
    console.log(getProjectList)
    return getProjectList
  }

  async checkPort() {
    const checkPort = await CodeHandler.checkPort('4000')
    return checkPort
  }

  async openService(body: OpenServiceDto) {
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
        // TO:DO:查端口和数据库存的端口是否一致的情况
        return findService
      }
      const path = join(viewProject, body.name)
      const fileList = readdirSync(path)
      const configPath = CodeHandler.checkConfigJs(fileList)
      let port
      // TO:DO:查端口是否存在，存在修改文件中的port
      if (configPath) {
        // return CodeHandler.readConfigPort(readConfig)
        const readConfig = readFileSync(join(path, configPath), 'utf-8')
        const getPort = CodeHandler.readConfigPort(readConfig)
        port = getPort
      } else {
        // 没有找到config文件，则查package.json是否设置了端口
        const packageJsonFilePath = join(path, './package.json')
        const readPackJson = readJsonSync(packageJsonFilePath)
        if (readPackJson) {
          if (readPackJson['scripts'] && readPackJson['scripts']['dev']) {
            const devScripts = readPackJson['scripts']['dev']
            const pattern = /(?<=cross-env PORT=).*?(?= )/g
            const mathData = devScripts.match(pattern)
            if (mathData.length > 0) {
              port = mathData[0]
            } else {
              return {
                code: 1,
                msg: '未找到package.json配置端口'
              }
            }
          } else {
            return {
              code: 1,
              msg: '未找到配置命令'
            }
          }
        } else {
          return {
            code: 1,
            msg: '未找到配置文件'
          }
        }
      }
      const service = new Service()
      service.user = this.user
      service.project = exist.data
      service.createTime = new Date().getTime()
      service.port = +port
      const save = await this.serviceRepository.save(service)
      if (save) {
        const run = await CodeHandler.runProject(path, body.name)
        const checkPort = await CodeHandler.checkPoll(port)
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
