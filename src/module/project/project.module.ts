/*
 * @Author: your name
 * @Date: 2021-12-15 11:20:44
 * @LastEditTime: 2021-12-20 11:00:54
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \webide-service\src\module\project\project.module.ts
 */
import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { JwtModule } from '@nestjs/jwt'
import { jwtSecret } from '@/config/constants'
import { ProjectController } from '@/module/project/project.controller'
import { ProjectService } from '@/module/project/project.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Project } from '@/entity/project.entity'
import { Service } from '@/entity/service.entity'

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: jwtSecret
    }),
    TypeOrmModule.forFeature([Project, Service])
  ],
  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule {}
