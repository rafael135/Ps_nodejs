export type StorageFileItem = {
  id: number;
  fileName: string;
  mimeType: string;
  folderPath?: string | null;
};

export type StorageFolderItem = {
  id: number;
  name: string;
};

export type StorageFileTypeFilter = "all" | "image" | "document" | "other";
