import { exec } from 'child_process'
import { platform } from 'os'
import { cacheProject, viewProject } from '@/config/constants'
import * as chokidar from 'chokidar'
import { ensureDir } from 'fs-extra'

/*
 * @Author: xzhbbc
 * @Date: 2021-12-20 11:19:30
 * @LastEditTime: 2021-12-27 11:09:32
 * @LastEditors: Please set LastEditors
 * @Description: 用命令行处理代码
 * @FilePath: \webide-service\src\utils\codeHandler.ts
 */
export class CodeHandler {
  static runProject(path: string, name: string) {
    return new Promise(resolve => {
      const process = exec(`cd ${path} && yarn dev`, (err, stdout, stderr) => {
        if (err) {
          console.log(err)
          process.kill()
        }
        console.log('stdout:', stdout)
        console.log('stderr:', stderr)
        console.log('构建结束outer===')
        process.kill()
      })
      resolve(true)
    })
  }

  static checkPort(port: string) {
    const cmd = platform() == 'win32' ? 'netstat -ano' : 'ps aux'
    return new Promise(resolve => {
      const mainProcess = exec(cmd, function (err, stdout, stderr) {
        if (err) {
          console.log(err)
          mainProcess.kill()
        }
        const portList = stdout.split('\n').filter(line => {
          const p = line.trim().split(/\s+/)
          const address = p[1]
          if (address && address.split(':')[1] == port) {
            return line
          }
        })
        mainProcess.kill()
        resolve(portList)
      })
    })
  }

  static async checkPoll(port: string) {
    const portList = (await this.checkPort(port)) as string[]
    if (portList && portList.length > 0) {
      return portList
    } else {
      return await this.checkPoll(port)
    }
  }

  static async killPort(port: string) {
    const cmd = platform() == 'win32' ? 'netstat -ano' : 'ps aux'
    return new Promise(resolve => {
      const mainProcess = exec(cmd, function (err, stdout, stderr) {
        if (err) {
          console.log(err, 'mainErr')
          mainProcess.kill()
          resolve(false)
        }

        stdout.split('\n').filter(function (line) {
          const p = line.trim().split(/\s+/)
          const address = p[1]

          if (address != undefined) {
            if (address.split(':')[1] == port) {
              const subProcess = exec('taskkill /F /pid ' + p[4])
              setTimeout(() => {
                subProcess.kill()
              }, 500)
              resolve(true)
            }
          }
        })
      })
    })
  }

  static checkConfigJs(pathList: string[]) {
    return pathList.find(item => item.indexOf('fec.config.js') > -1) || ''
  }

  static readConfigPort(code: string) {
    const pattern = /(?<=port:).*?(?=,)/g
    const mathData = code.match(pattern)
    if (mathData.length > 0) {
      return mathData[0].trim()
    } else {
      return ''
    }
  }

  static createProject(name: string, cmd: string) {
    return new Promise(resolve => {
      const process = exec(
        `cd ${cacheProject} && ${cmd}`,
        (err, stdout, stderr) => {
          if (err) {
            console.log(err)
            resolve(false)
          }
          console.log('stdout:', stdout)
          console.log('stderr:', stderr)
          process.kill()
        }
      )
      resolve(true)
    })
  }

  static watchFile(file: string) {
    let timer = null
    let pollCheckTimer = null
    let noFileChange = false
    return new Promise(resolve => {
      const watcher = chokidar.watch(file, {
        persistent: true
      })
      // watcher.add('new-file')
      watcher.on('raw', (name, path) => {
        // console.log(name, path)
        noFileChange = false
      })
      // 2秒轮询一次，看是否结束创建
      pollCheckTimer = setTimeout(() => {
        if (noFileChange) {
          watcher.close()
          timer && clearTimeout(timer)
          pollCheckTimer && clearTimeout(pollCheckTimer)
          resolve(true)
        } else {
          noFileChange = true
        }
      }, 2000)
      // 50秒后，还为成功，就代表超时失败
      timer = setTimeout(() => {
        console.log('超时了======')
        watcher.close()
        timer && clearTimeout(timer)
        pollCheckTimer && clearTimeout(pollCheckTimer)
        resolve(false)
      }, 60000 * 3)
    })
  }

  static createDir() {
    ensureDir(viewProject)
    ensureDir(cacheProject)
  }
}
