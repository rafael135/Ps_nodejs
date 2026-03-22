import { FileRepository } from "../../../repositories/fileRepository";
import { File } from "../../../entities";
import { classifyFileType } from "./classifyFileType";

type RetriveFileFilters = {
  type?: "image" | "document" | "other";
  folderPath?: string | null;
};

export class RetriveFileUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  public async execute(userId: number, filters?: RetriveFileFilters): Promise<File[]> {
    try {
      const files = await this.fileRepository.findByUserId(userId, {
        folderPath: filters?.folderPath,
      });

      if (!filters?.type) return files;

      return files.filter(
        (file) => classifyFileType(file.mimeType) === filters.type
      );
    } catch (error) {
      return [];
    }
  }
}
