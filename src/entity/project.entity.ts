import {
  Column,
  Entity,
  ObjectID,
  ObjectIdColumn,
  OneToOne,
  JoinColumn
} from 'typeorm'
import { Scaffold } from '@/entity/scaffold.entity'

@Entity()
export class Project {
  @ObjectIdColumn()
  id: ObjectID

  @Column()
  name: string

  // TO:DO 关联用户表
  // 开启的用户名
  @Column()
  user: string

  // 脚手架
  @Column()
  scaffold: Scaffold

  @Column()
  createTime: number

  @Column()
  updateTime: number
}
