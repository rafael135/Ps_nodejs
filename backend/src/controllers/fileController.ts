import { Request, Response } from "express";
import { UploadFileUseCase } from "../use-cases/file/uploadFile/uploadFileUseCase";
import { FileRepository } from "../repositories/fileRepository";
import { RetriveFileUseCase } from "../use-cases/file/retrive/retriveFilesUseCase";
import { FolderRepository } from "../repositories/folderRepository";
import { getConstants } from "../constants";
import { promises as fs } from "fs";
import path from "path";
import { DeleteFileUseCase } from "../use-cases/file/deleteFile/deleteFileUseCase";

type FileTypeFilter = "image" | "document" | "other";

class FileController {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly retriveFileUseCase: RetriveFileUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly fileRepository: FileRepository,
    private readonly folderRepository: FolderRepository
  ) {}

  private normalizeFolderName(folderName: string) {
    return `${folderName || ""}`.trim();
  }

  private normalizeFolderPath(value?: string | null): string | null {
    if (value === null) return null;
    const normalized = this.normalizeFolderName(value || "");
    return normalized || null;
  }

  public async upload(req: Request, res: Response) {
    try {
      const folderPath = this.normalizeFolderPath(req.headers.folderPath as string);

      if (folderPath) {
        const folder = await this.folderRepository.findByName(
          Number(req.headers.user),
          folderPath
        );

        if (!folder) {
          await this.folderRepository.save({
            name: folderPath,
            userId: Number(req.headers.user),
          });
        }
      }

      const response = await this.uploadFileUseCase.execute({
        fileName: req.headers.fileName as string,
        mimeType: req.headers.mimeType as string,
        folderPath,
        userId: Number(req.headers.user),
      });

      res.status(200).send({ file: response });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }

  public async list(req: Request, res: Response) {
    const folderQuery = req.query.folder as string | undefined;
    const typeQuery = req.query.type as FileTypeFilter | undefined;
    const hasFolderFilter = folderQuery !== undefined;
    const normalizedFolder =
      folderQuery === "root"
        ? null
        : this.normalizeFolderPath(folderQuery || undefined);

    const response = await this.retriveFileUseCase.execute(
      Number(req.headers.user),
      {
        folderPath: hasFolderFilter ? normalizedFolder : undefined,
        type: typeQuery,
      }
    );

    res.status(200).send({ files: response });
  }

  public async listFolders(req: Request, res: Response) {
    const folders = await this.folderRepository.findByUserId(Number(req.headers.user));

    res.status(200).send({ folders });
  }

  public async createFolder(req: Request, res: Response) {
    const folderName = this.normalizeFolderName(req.body?.name);

    if (!folderName) {
      return res.status(400).send({ message: getConstants().FOLDER_NAME_REQUIRED });
    }

    const userId = Number(req.headers.user);
    const existingFolder = await this.folderRepository.findByName(userId, folderName);

    if (existingFolder) {
      return res.status(400).send({ message: getConstants().FOLDER_ALREADY_EXISTS });
    }

    const folder = await this.folderRepository.save({ name: folderName, userId });

    return res.status(201).send({ folder });
  }

  public async renameFolder(req: Request, res: Response) {
    const oldName = this.normalizeFolderName(req.body?.oldName);
    const newName = this.normalizeFolderName(req.body?.newName);

    if (!oldName || !newName) {
      return res.status(400).send({ message: getConstants().FOLDER_NAME_REQUIRED });
    }

    const userId = Number(req.headers.user);
    const oldFolder = await this.folderRepository.findByName(userId, oldName);
    if (!oldFolder) {
      return res.status(404).send({ message: getConstants().FOLDER_NOT_FOUND });
    }

    const existingNew = await this.folderRepository.findByName(userId, newName);
    if (existingNew) {
      return res.status(400).send({ message: getConstants().FOLDER_ALREADY_EXISTS });
    }

    await this.folderRepository.rename(userId, oldName, newName);
    await this.fileRepository.renameFolderPathByUserId(userId, oldName, newName);

    return res.status(200).send();
  }

  public async deleteFolder(req: Request, res: Response) {
    const folderName = this.normalizeFolderName(req.params.name);

    if (!folderName) {
      return res.status(400).send({ message: getConstants().FOLDER_NAME_REQUIRED });
    }

    const userId = Number(req.headers.user);
    const folder = await this.folderRepository.findByName(userId, folderName);

    if (!folder) {
      return res.status(404).send({ message: getConstants().FOLDER_NOT_FOUND });
    }

    const deletedFiles = await this.fileRepository.deleteByFolderPath(userId, folderName);
    await this.folderRepository.delete(userId, folderName);

    await Promise.all(
      deletedFiles.map(async (file) => {
        const filePath = path.resolve("uploads", file.fileName);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          return null;
        }
      })
    );

    return res.status(200).send({ deletedFiles: deletedFiles.length });
  }

  public async moveFile(req: Request, res: Response) {
    const userId = Number(req.headers.user);
    const fileId = Number(req.params.id);
    const folderPath = this.normalizeFolderPath(req.body?.folderPath);

    if (folderPath) {
      const folder = await this.folderRepository.findByName(userId, folderPath);
      if (!folder) {
        return res.status(404).send({ message: getConstants().FOLDER_NOT_FOUND });
      }
    }

    const moved = await this.fileRepository.moveFile(userId, fileId, folderPath);

    if (!moved) {
      return res.status(404).send({ message: getConstants().FILE_NOT_FOUND });
    }

    return res.status(200).send();
  }

  public async deleteFile(req: Request, res: Response) {
    const userId = Number(req.headers.user);
    const fileId = Number(req.params.id);

    if (!fileId) {
      return res.status(400).send({ message: getConstants().INCORRECT_PAYLOAD });
    }

    const deletedFile = await this.deleteFileUseCase.execute({ fileId, userId });

    if (!deletedFile) {
      return res.status(404).send({ message: getConstants().FILE_NOT_FOUND });
    }

    const filePath = path.resolve("uploads", deletedFile.fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
    }

    return res.status(200).send({ file: deletedFile });
  }
}

const fileRepository = new FileRepository();

export const fileController = new FileController(
  new UploadFileUseCase(fileRepository),
  new RetriveFileUseCase(fileRepository),
  new DeleteFileUseCase(fileRepository),
  fileRepository,
  new FolderRepository()
);
