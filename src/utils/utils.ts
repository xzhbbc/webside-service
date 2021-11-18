import * as moment from 'moment'
import * as crypto from 'crypto'

const DATE_FORMAT = 'YYYY-MM-DD'
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export default class Utils {
  static dateFormat = (inp?: moment.MomentInput) =>
    moment(inp).format(DATE_FORMAT)

  static timeFormat = (inp?: moment.MomentInput) =>
    moment(inp).format(TIME_FORMAT)

  static md5Encode = (data: string) => {
    const hash = crypto.createHash('md5')
    return hash.update(data).digest('hex').toLowerCase()
  }

  // 下划线转换驼峰
  static toHump(name: string) {
    return name.replace(/\_(\w)/g, function (all, letter) {
      return letter.toUpperCase()
    })
  }

  // 驼峰转换下划线
  static toLine(name: string) {
    return name.replace(/([A-Z])/g, '_$1').toLowerCase()
  }

  // 首字母大写
  static upperFirstCase(name: string) {
    return name.slice(0, 1).toUpperCase() + name.slice(1)
  }

  static replacePath(name: string) {
    return name.split('\\').join('/')
  }
}
