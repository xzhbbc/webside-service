import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm'

@Entity()
export class Scaffold {
  @ObjectIdColumn()
  id: ObjectID

  // 框架
  @Column()
  modelName: string

  // 脚手架名字
  @Column()
  scaffoldName: string

  // 模板文件名
  @Column()
  fileModelName: string
}
