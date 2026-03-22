import { getConstants } from "../../../constants";
import { ApplicationError } from "../../../errors/applicationError";
import { FileRepository } from "../../../repositories/fileRepository";
import { DeleteFileRequestDto } from "./deleteFileRequest.dto";

export class DeleteFileUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  public async execute(data: DeleteFileRequestDto) {
    try {
      return await this.fileRepository.deleteById(data.userId, data.fileId);
    } catch (error) {
      throw new ApplicationError(getConstants().ERROR_TO_DELETE_FILE);
    }
  }
}
