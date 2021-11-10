export class ResponseDto<T> {
  constructor(data: T, msg = '', code = 0) {
    this.code = code
    this.msg = msg
    this.data = data
  }

  readonly code: number

  readonly msg: string

  readonly data: T
}
