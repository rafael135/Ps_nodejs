import { Repository } from "typeorm";
import { AppDataSource } from "../database/appDataSource";
import { File } from "../entities";
import { UploadFileRequestDto } from "../use-cases/file/uploadFile/uploadFileRequest.dto";

type FindFilesFilters = {
  folderPath?: string | null;
};

export class FileRepository {
  private fileRepository: Repository<File>;

  constructor() {
    this.fileRepository = AppDataSource.getRepository(File);
  }

  public async save(file: UploadFileRequestDto): Promise<File> {
    return this.fileRepository.save(file);
  }

  public async findByUserId(
    userId: number,
    filters?: FindFilesFilters
  ): Promise<File[]> {
    const where: any = { userId };

    if (filters?.folderPath !== undefined) {
      where.folderPath = filters.folderPath;
    }

    return this.fileRepository.findBy(where);
  }

  public async renameFolderPathByUserId(
    userId: number,
    oldFolderPath: string,
    newFolderPath: string
  ): Promise<void> {
    await this.fileRepository.update(
      { userId, folderPath: oldFolderPath },
      { folderPath: newFolderPath }
    );
  }

  public async moveFile(
    userId: number,
    fileId: number,
    folderPath?: string
  ): Promise<boolean> {
    const result = await this.fileRepository.update(
      { id: fileId, userId },
      { folderPath: folderPath || null }
    );

    return (result.affected || 0) > 0;
  }

  public async deleteByFolderPath(
    userId: number,
    folderPath: string
  ): Promise<File[]> {
    const files = await this.fileRepository.findBy({ userId, folderPath });
    if (!files.length) return [];

    await this.fileRepository.delete({ userId, folderPath });
    return files;
  }
}
