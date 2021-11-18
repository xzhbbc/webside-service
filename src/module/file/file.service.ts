import { Injectable } from '@nestjs/common'
import { CodeDto, FileDto } from '@/module/file/file.swagger'
import { codeTemplate, fileProject } from '@/config/constants'
import {
  readFileSync,
  existsSync,
  writeFileSync,
  readdirSync,
  statSync
} from 'fs'
import * as fs from 'fs-extra'
import { exec } from 'child_process'
import VueHandler from '@/utils/vueHandler'
import { join } from 'path'
import Utils from '@/utils/utils'

@Injectable()
export class FileService {
  private async buildFile() {
    console.log('开始构建')
    return new Promise(resolve => {
      try {
        exec(`cd ${fileProject.viewPathSrc} && yarn lint && yarn build`, () => {
          console.log('构建结束')
          resolve(true)
        })
      } catch (err) {
        console.log('构建失败', err)
        resolve(false)
      }
    })
  }

  private getFileCatalog(dir, lastIndex) {
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
          key: `${lastIndex}-${i}`,
          path: Utils.replacePath(pathDir.split(fileProject.templatePath)[1]),
          type: 'directory'
        })
      } else if (fileMsg.isDirectory()) {
        fileList.unshift({
          name: file,
          title: file,
          key: `${lastIndex}-${i}`,
          path: Utils.replacePath(pathDir.split(fileProject.templatePath)[1]),
          type: 'directory',
          children: this.getFileCatalog(pathDir, `${lastIndex}-${i}`)
        })
      } else {
        fileList.push({
          name: file,
          title: file,
          key: `${lastIndex}-${i}`,
          path: Utils.replacePath(pathDir.split(fileProject.templatePath)[1]),
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
    const pageData = readFileSync(
      join(fileProject.templatePath, data.name),
      'utf8'
    )
    const template = VueHandler.getTemplate(pageData)
    const script = VueHandler.getScript(pageData)
    const css = VueHandler.getCss(pageData)
    return {
      template,
      script,
      css
    }
  }

  async setCode(data: CodeDto) {
    console.log(data)
    const vueFile = `${fileProject.viewPathVue}/${data.name}/index.vue`
    const code = `${data.html}

${data.script}

${data.css}
`
    try {
      fs.writeFileSync(vueFile, code)
      const buildFile = await this.buildFile()
      if (buildFile) {
        return {
          msg: '成功'
        }
      } else {
        return {
          msg: '构建失败',
          code: 1
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

  async getCatalog() {
    // const catalog = readdirSync(`${fileProject.templatePath}`)
    // console.log(catalog)
    return this.getFileCatalog(`${fileProject.templatePath}`, 0)
  }
}
