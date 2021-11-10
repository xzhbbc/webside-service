import { LoggerService, Injectable, Global } from '@nestjs/common'
import * as bunyan from 'bunyan'

@Global()
@Injectable()
export class BaseLogger implements LoggerService {
  private readonly logger: bunyan

  constructor(logger: bunyan) {
    this.logger = logger
  }
  log(...args: any[]) {
    this.logger.info(args)
  }
  error(err: any, trace?: string) {
    this.logger.error(err, trace)
  }
  warn(...args: any[]) {
    this.logger.warn(args)
  }
  debug(...args: any[]) {
    this.logger.debug(args)
  }

  child({ component }: { component: string }) {
    return new BaseLogger(this.logger.child({ component }))
  }
}
