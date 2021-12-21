import { exec } from 'child_process'
import { platform } from 'os'

/*
 * @Author: xzhbbc
 * @Date: 2021-12-20 11:19:30
 * @LastEditTime: 2021-12-20 18:13:26
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
}
