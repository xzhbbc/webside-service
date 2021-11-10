import { createStackdriverLogger } from './stack.logging'
import { createLocalLogger } from './local.logging'

export const createLogger =
  process.env.NODE_ENV == 'production'
    ? createStackdriverLogger
    : createLocalLogger
