import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("file")
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  fileName: string;

  @Column({ type: "varchar" })
  mimeType: string;

  @Column({ type: "varchar", nullable: true })
  folderPath: string;

  @Column({ type: "integer" })
  userId: number;
}
