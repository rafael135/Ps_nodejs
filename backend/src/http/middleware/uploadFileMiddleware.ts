import md5 from "md5";
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { getConstants } from "../../constants";

class UploadFileMiddleware {
  public execute() {
    const storage = this.createStorage();

    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
    });

    return (req: Request, res: Response, next: NextFunction) => {
      upload.single("file")(req, res, (error: any) => {
        const request = req as Request & { file?: { mimetype: string } };

        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .send({ message: getConstants().FILE_SIZE_LIMIT_EXCEEDED });
        }

        if (error) {
          return res.status(400).send({ message: error.message });
        }

        if (!request.file) {
          return res.status(400).send({ message: getConstants().FILE_REQUIRED });
        }

        req.headers.mimeType = request.file.mimetype;

        const folderPath = `${req.body?.folderPath || ""}`.trim();
        if (folderPath) {
          req.headers.folderPath = folderPath;
        }

        return next();
      });
    };
  }

  private createStorage() {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./uploads");
      },
      filename: function (req, file, cb) {
        const timestamp = Date.now();
        const userHash = md5(`${req.headers.user}`);
        const fileName = `${timestamp}_${userHash}_${file.originalname}`;

        req.headers.fileName = fileName;
        cb(null, fileName);
      },
    });
  }
}

export const uploadFileMiddleware = new UploadFileMiddleware();
