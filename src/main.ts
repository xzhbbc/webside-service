import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { createLogger } from './help/logging'
import { HttpExceptionFilter } from './help/interceptor/http-exception.filter'
import { SuccessInterceptor } from './help/interceptor/success.interceptor'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

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
  if (process.env.BUILD_ENV != 'prod') {
    const options = new DocumentBuilder()
      .setTitle('nest模板')
      .setDescription('nest模板===')
      .setVersion('1.0')
      .addTag('nest')
      .addBearerAuth()
      // .addOAuth2({ type: 'oauth2', in: 'header', name: 'Authorization' })
      .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('swagger', app, document)
  }
  await app.listen(3000)
}
bootstrap()
