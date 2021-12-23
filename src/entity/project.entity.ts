import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm'

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
  scaffold: string

  // 框架
  @Column()
  modelName: string

  @Column()
  createTime: number

  @Column()
  updateTime: number
}
