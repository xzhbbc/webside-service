import { Injectable } from '@nestjs/common'
import { createLogger } from './index'
import { BaseLogger } from './base.logging'

export { BaseLogger }

@Injectable()
export class LoggerService {
  static log: BaseLogger

  constructor() {
    createLogger().then(({ logger }) => {
      LoggerService.log = logger
    })
  }

  child({ component }: { component: string }) {
    return LoggerService.log.child({ component })
  }
}
