import * as moment from 'moment'

const DATE_FORMAT = 'YYYY-MM-DD'
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export default class Utils {
  static dateFormat = (inp?: moment.MomentInput) =>
    moment(inp).format(DATE_FORMAT)

  static timeFormat = (inp?: moment.MomentInput) =>
    moment(inp).format(TIME_FORMAT)
}
