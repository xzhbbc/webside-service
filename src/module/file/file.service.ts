import { Body, Injectable } from '@nestjs/common'
import { CodeDto, FileDto, ProjectDto } from '@/module/file/file.swagger'
import {
  canWriteFile,
  codeTemplate,
  fileProject,
  viewProject
} from '@/config/constants'
import {
  readFileSync,
  existsSync,
  writeFileSync,
  readdirSync,
  statSync
} from 'fs'
import * as fs from 'fs-extra'
import { exec, spawn } from 'child_process'
import { platform } from 'os'
import VueHandler from '@/utils/vueHandler'
import { join } from 'path'
import Utils from '@/utils/utils'

@Injectable()
export class FileService {
  private signalList: Record<any, any>
  private processList: Record<any, any>
  constructor() {
    this.signalList = {}
    this.processList = {}
  }

  private async killPort(port: string) {
    const cmd = platform() == 'win32' ? 'netstat -ano' : 'ps aux'
    return new Promise(resolve => {
      const mainProcess = exec(cmd, function (err, stdout, stderr) {
        if (err) {
          console.log(err)
          mainProcess.kill()
          resolve(false)
        }

        stdout.split('\n').filter(function (line) {
          const p = line.trim().split(/\s+/)
          const address = p[1]

          if (address != undefined) {
            if (address.split(':')[1] == port) {
              const subProcess = exec(
                'taskkill /F /pid ' + p[4],
                function (err, stdout, stderr) {
                  if (err) {
                    console.log('释放指定端口失败！！')
                    subProcess.kill()
                    resolve(false)
                  }
                  subProcess.kill()
                  resolve(true)
                }
              )
            }
          }
        })
      })
    })
  }

  private async runProject(path: string, name: string) {
    return new Promise(resolve => {
      const process = exec(`cd ${path} && yarn dev`, (err, stdout, stderr) => {
        if (err) {
          console.log(err)
          delete this.signalList[name]
          process.kill()
        }
        console.log('stdout:', stdout)
        console.log('stderr:', stderr)
        console.log('构建结束outer===')
        delete this.signalList[name]
        process.kill()
      })
      this.signalList[name] = process.pid
      resolve(true)
    })
  }

  private async buildFile() {
    console.log('开始构建')
    return new Promise(resolve => {
      try {
        exec(
          `cd ${fileProject.viewPathSrc} && yarn lint`,
          (err, stdout, stderr) => {
            if (err) {
              console.log(err)
              resolve(false)
            }
            console.log('stdout:', stdout)
            console.log('stderr:', stderr)
            console.log('构建结束')
            resolve(true)
          }
        )
      } catch (err) {
        console.log('构建失败', err)
        resolve(false)
      }
    })
  }

  private getFileCatalog(dir, lastIndex, originalDir) {
    const files = readdirSync(dir)
    const fileList = []
    files.forEach((file, i) => {
      const pathDir = join(dir, file)
      const fileMsg = statSync(pathDir)
      if (file == '.git' || file == '.idea' || file == 'output') return
      if (file == 'node_modules') {
        fileList.unshift({
          name: file,
          title: file,
          parent: Utils.replacePath(dir.split(originalDir)[1]),
          key: `${lastIndex}-${i}`,
          path: Utils.replacePath(pathDir.split(originalDir)[1]),
          type: 'directory'
        })
      } else if (fileMsg.isDirectory()) {
        fileList.unshift({
          name: file,
          title: file,
          key: `${lastIndex}-${i}`,
          parent: Utils.replacePath(dir.split(originalDir)[1]),
          path: Utils.replacePath(pathDir.split(originalDir)[1]),
          type: 'directory',
          children: this.getFileCatalog(
            pathDir,
            `${lastIndex}-${i}`,
            originalDir
          )
        })
      } else {
        fileList.push({
          name: file,
          title: file,
          key: `${lastIndex}-${i}`,
          parent: Utils.replacePath(dir.split(originalDir)[1]),
          path: Utils.replacePath(pathDir.split(originalDir)[1]),
          type: 'file'
        })
      }
    })
    return fileList
  }

  async init(data: FileDto) {
    const pageData = readFileSync(fileProject.rootPath, 'utf8')
    const patternTemplate = /(?<=<template>).*?(?=<\/template>)/g
    const patternScript = /(?<=<script>).*?(?=<\/script>)/g
    const patternCss = /(?<=<style lang="scss">).*?(?=<\/style>)/g
    const pageReplaceBr = pageData.replace(/\n/g, '<br>')
    console.log(pageReplaceBr.match(patternTemplate))
    console.log(pageReplaceBr.match(patternScript))
    console.log(pageReplaceBr.match(patternCss))
    return pageReplaceBr
  }

  async getCode(data: FileDto) {
    const pageData = readFileSync(join(viewProject, data.name), 'utf8')
    if (data.name.indexOf('.vue') > -1) {
      const template = VueHandler.getTemplate(pageData)
      const script = VueHandler.getScript(pageData)
      const css = VueHandler.getCss(pageData)
      return {
        template,
        script,
        css,
        justRead: false
      }
    } else {
      if (data.name.indexOf('css') > -1) {
        return {
          css: pageData,
          script: '',
          template: '',
          justRead: true
        }
      } else {
        return {
          css: '',
          script: pageData,
          template: '',
          justRead: true
        }
      }
    }
  }

  async setCode(data: CodeDto) {
    const path = join(viewProject, data.name)
    if (!existsSync(path)) {
      return {
        msg: '不存在改项目',
        code: 1
      }
    }
    console.log(data)
    try {
      if (data.name.indexOf('.vue') > -1) {
        const code = `${data.html}
  
        ${data.script}
        
        ${data.css}
        `
        fs.writeFileSync(path, code)
        // const buildFile = await this.buildFile()
        // if (buildFile) {
        //   return {
        //     msg: '成功'
        //   }
        // } else {
        //   return {
        //     msg: '构建失败',
        //     code: 1
        //   }
        // }
        return {
          msg: '成功'
        }
      } else {
        fs.writeFileSync(path, data.html || data.css || data.script)
        return {
          msg: '成功'
        }
      }
    } catch (err) {
      return {
        code: 1,
        msg: err.msg
      }
    }
  }

  async createFile(data: FileDto) {
    if (!data.name)
      return {
        msg: '请填写文件名称'
      }
    const jsFile = `${fileProject.viewPathSrc}/${data.name}.js`
    const hbsFile = `${fileProject.viewPathHbs}/${data.name}.hbs`
    const vueFileRoot = `${fileProject.viewPathVue}/${data.name}`
    const vueFile = `${vueFileRoot}/index.vue`
    if (!existsSync(jsFile)) {
      fs.ensureFileSync(jsFile)
      writeFileSync(jsFile, codeTemplate.root(data.name))
      fs.ensureFileSync(hbsFile)
      writeFileSync(hbsFile, codeTemplate.hbs())
      fs.ensureDirSync(vueFileRoot)
      fs.ensureFileSync(vueFile)
      writeFileSync(vueFile, codeTemplate.vue(data.name))
      const buildFile = await this.buildFile()
      if (buildFile) {
        return {
          msg: '创建成功'
        }
      } else {
        return {
          msg: '创建失败',
          code: 1
        }
      }
    } else {
      return {
        msg: '已经存在该文件',
        code: 1
      }
    }
  }

  async getFileList() {
    const fileList = readdirSync(`${fileProject.viewPathVue}`)
    // console.log(fileProject.viewPathVue.split(fileProject.templatePath)[1])
    const fileDataList = []
    const path = fileProject.viewPathVue.split(fileProject.templatePath)[1]
    fileList.forEach(name => {
      fileDataList.push({
        fileName: name,
        path: `${Utils.replacePath(path)}/${name}/index.vue`,
        modelName: 'fec(Vue)'
      })
    })
    return {
      fileList: fileDataList
    }
  }

  async getCatalog(body: ProjectDto) {
    const path = join(viewProject, body.name)
    if (!existsSync(path)) {
      return {
        msg: '不存在改项目',
        code: 1
      }
    }
    return this.getFileCatalog(path, 0, path)
    // const catalog = readdirSync(`${fileProject.templatePath}`)
    // console.log(catalog)
  }

  async getProject() {
    const fileList = readdirSync(viewProject)
    // TO:DO 换成读数据库
    return [
      {
        projectName: fileList[0],
        modelName: 'react'
      },
      {
        projectName: fileList[1],
        modelName: 'vue'
      }
    ]
  }

  async getSignalList() {
    return {
      signalList: this.signalList
    }
  }

  async killProject(body: ProjectDto) {
    if (this.signalList[body.name]) {
      // const endProcess = spawn('kill', [this.signalList[body.name]])
      // const endProcess = spawn('cmd.exe', [
      //   '/c',
      //   'taskkill',
      //   'pid',
      //   this.signalList[body.name],
      //   '/f',
      //   '/t'
      // ])
      // endProcess.stdout.on('data', function (data) {
      //   console.log('standard output:\n' + data)
      // })
      // endProcess.stderr.on('data', function (data) {
      //   console.log('standard error output:\n' + data)
      // })
      // console.log(this.processList[body.name])
      // console.log(platform())
      // if (this.processList[body.name].kill(this.signalList[body.name])) {
      //   delete this.processList[body.name]
      //   delete this.signalList[body.name]
      //   return {
      //     msg: `杀死进程了 ${body.name}`
      //   }
      // } else {
      //   return {
      //     msg: `未杀死进程 ${body.name}`
      //   }
      // }
      const port = '3003'

      const killProcess = await this.killPort(port)
      if (killProcess) {
        return {
          msg: `杀死进程了 ${body.name}`
        }
      } else {
        return {
          msg: `未杀死进程 ${body.name}`
        }
      }
    } else {
      return {
        msg: '不存在改项目',
        code: 1
      }
    }
    // spawn('kill', ['-9', ])
  }

  async setCmd(body: ProjectDto) {
    // const controller = new AbortController()
    // const { signal } = controller
    // console.log(signal)
    // this.signalList.push(signal)
    const path = `${viewProject}/${body.name}`
    if (!existsSync(path)) {
      return {
        msg: '不存在改项目',
        code: 1
      }
    }
    const run = await this.runProject(path, body.name)
    if (run) {
      return {
        msg: `运行成功，${body.name}`
      }
    } else {
      return {
        msg: `运行失败，${body.name}`,
        code: 1
      }
    }
  }
}
