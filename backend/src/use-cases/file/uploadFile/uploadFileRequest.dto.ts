export class UploadFileRequestDto {
  fileName: string;
  mimeType: string;
  folderPath?: string;
  userId: number;
}
