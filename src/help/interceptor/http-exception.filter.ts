import {
  ArgumentsHost,
  Catch,
  HttpException,
  ExceptionFilter,
  HttpStatus
} from '@nestjs/common'
import { LoggerService } from '../logging/logger.service'
import utils from '@/utils/utils'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR
    const resJson = exception.getResponse()
    console.log('resError:', resJson)
    // this.logger.error('服务端报错', JSON.stringify(resJson));
    // const responseText = JSON.stringify(resJson);

    const merged = typeof resJson === 'object' ? resJson : {}
    const nowDate = utils.timeFormat()
    if (status >= 500) {
      const nowDate = utils.timeFormat()
      new LoggerService()
        .child({ component: 'HttpError' })
        .error(`${nowDate}服务端报错`, JSON.stringify(resJson))
    }
    // if (status != 500) {
    //   return super.catch(exception, host);
    // }
    // console.log(response.status(status));
    // response.status();
    // const html = file.readFileSync(
    //   path.join(__dirname, '../../../views/dist/index.html'),
    //   'utf8',
    // );
    // console.log(status, '错哦污编码', status == 404);
    response.status(status).send({
      data: {},
      code: 1,
      timestamp: nowDate,
      msg: '',
      ...merged
    })
  }
}
