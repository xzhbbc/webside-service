import { CallHandler, ExecutionContext } from '@nestjs/common'
import { Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ResponseDto } from '../type/Response.dto'

const isLikeResponseDto = data =>
  data &&
  data.code !== undefined &&
  data.msg !== undefined &&
  data.data !== undefined

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data = {}) => {
        if (Array.isArray(data) || typeof data !== 'object') {
          return new ResponseDto(data, '请求成功', 0)
        }

        if (data instanceof ResponseDto || isLikeResponseDto(data)) {
          return data
        }
        // 有msg 或者 code 则走请求失败回参数
        if (
          (Object.prototype.toString.call(data) === '[object Object]' &&
            data.hasOwnProperty('code') &&
            !data.hasOwnProperty('id')) ||
          data.hasOwnProperty('msg')
        ) {
          return new ResponseDto(
            data.data || null,
            data.msg || '请求失败',
            data.code
          )
        } else {
          return new ResponseDto(data, '请求成功', 0)
        }
      })
    )
  }
}
