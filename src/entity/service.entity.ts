/*
 * @Author: your name
 * @Date: 2021-12-15 10:30:05
 * @LastEditTime: 2021-12-24 11:50:58
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \webide-service\src\entity\service.entity.ts
 */
import { Column, Entity, ObjectID, OneToOne, ObjectIdColumn } from 'typeorm'
import { Project } from '@/entity/project.entity'

@Entity()
export class Service {
  @ObjectIdColumn()
  id: ObjectID

  // 开启的项目名
  @Column()
  project: Project

  // TO:DO 关联用户表
  // 开启的用户名
  @Column()
  user: string

  @Column()
  port: number

  @Column()
  createTime: number
}
