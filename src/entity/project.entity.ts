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

  @Column()
  scaffold: string

  @Column()
  createTime: number

  @Column()
  updateTime: number
}
