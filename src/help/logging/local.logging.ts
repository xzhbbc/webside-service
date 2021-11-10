import * as bunyan from 'bunyan'
import { Request, Response } from 'express'
import { BaseLogger } from './base.logging'

export const createLocalLogger = async () => {
  const logger = bunyan.createLogger({
    name: 'myapp',
    streams: [{ stream: process.stdout, level: 'debug' }]
  })

  const mw = (req: Request, res: Response, next: () => void) => {
    let sec = Date.now()
    res.on('finish', () => {
      logger.debug(
        `url: ${req.url} method: ${req.method} status: ${res.statusCode} ms: ${
          Date.now() - sec
        }`
      )
      sec = null
    })
    next()
  }

  const newLogger = new BaseLogger(logger)

  return { logger: newLogger, mw, baseLogger: logger, errorPath: '' }
}
