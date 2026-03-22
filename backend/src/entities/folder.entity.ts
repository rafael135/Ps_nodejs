import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("folder")
@Unique(["userId", "name"])
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "integer" })
  userId: number;
}
