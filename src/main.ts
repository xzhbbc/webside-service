import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { createLogger } from './help/logging'
import { HttpExceptionFilter } from './help/interceptor/http-exception.filter'
import { SuccessInterceptor } from './help/interceptor/success.interceptor'

async function bootstrap() {
  const { logger, mw, baseLogger } = await createLogger()
  const app = await NestFactory.create(AppModule, {
    logger
  })
  // 全局成功拦截器
  app.useGlobalInterceptors(new SuccessInterceptor())
  app.enableCors({
    origin: '*',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Authorization, Accept'
  })
  // 注册全局http异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter())
  app.use(mw)
  await app.listen(3000)
}
bootstrap()
