import { Repository } from "typeorm";
import { AppDataSource } from "../database/appDataSource";
import { Folder } from "../entities";

export class FolderRepository {
  private folderRepository: Repository<Folder>;

  constructor() {
    this.folderRepository = AppDataSource.getRepository(Folder);
  }

  public async save(folder: Pick<Folder, "name" | "userId">): Promise<Folder> {
    return this.folderRepository.save(folder);
  }

  public async findByUserId(userId: number): Promise<Folder[]> {
    return this.folderRepository.findBy({ userId });
  }

  public async findByName(userId: number, name: string): Promise<Folder | null> {
    return this.folderRepository.findOneBy({ userId, name });
  }

  public async rename(userId: number, oldName: string, newName: string): Promise<void> {
    await this.folderRepository.update({ userId, name: oldName }, { name: newName });
  }

  public async delete(userId: number, name: string): Promise<void> {
    await this.folderRepository.delete({ userId, name });
  }
}
