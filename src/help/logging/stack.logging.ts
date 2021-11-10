import * as bunyan from 'bunyan'
import { Request, Response } from 'express'
import { BaseLogger } from './base.logging'
import { ConfigService } from '@/config/config.service'
import * as path from 'path'
import Utils from '@/utils/utils'

export const createStackdriverLogger = async () => {
  const LOGS_PATH = new ConfigService().get('LOGS_PATH')
  const nowDate = Utils.dateFormat()
  const logger = bunyan.createLogger({
    name: `webIde-${process.env.BUILD_ENV}`,
    streams: [
      { stream: process.stdout, level: 'debug' },
      {
        type: 'file',
        path: `${LOGS_PATH}/${nowDate}.log`
      },
      // {
      //   path: `${LOGS_PATH}/${nowDate}-rf.log`,
      //   type: 'rotating-file',
      //   period: '1d',
      //   count: 3,
      // },
      {
        // path: `${LOGS_PATH}/error.log`,
        path: path.join(__dirname, `../../../../logs/error.log`),
        type: 'file',
        level: 'error'
        // period: '1d',
        // count: 3,
      }
    ]
  })

  const mw = (req: Request, res: Response, next: () => void) => {
    let sec = Date.now()

    res.on('finish', () => {
      let uid = ''
      try {
        const token = (req as any)._userToken
        uid = token?.realUid || token?.uid || ''
      } catch (e) {
        //
      }
      logger.info(
        {
          url: req.url,
          method: req.method,
          status: res.statusCode,
          uid,
          ms: Date.now() - sec
        }
        // `url: ${req.url} method: ${req.method} status: ${res.statusCode} uid: ${uid} ms: ${Date.now() - sec}`,
      )
      sec = null
    })
    next()
  }

  const newLogger = new BaseLogger(logger)

  return {
    logger: newLogger,
    mw,
    baseLogger: logger
    // errorPath: `${LOGS_PATH}/${nowDate}-rf-error.log`,
  }
}
