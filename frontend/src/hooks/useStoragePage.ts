import { getConstants } from "@/constants";
import { deleteFileService } from "@/services/deleteFileService";
import { getAllFilesService } from "@/services/getAllFilesService";
import {
  createFolderService,
  deleteFolderService,
  getFoldersService,
  moveFileService,
  renameFolderService,
} from "@/services/folderServices";
import { uploadFiles } from "@/services/uploadFiles";
import {
  StorageFileItem,
  StorageFileTypeFilter,
  StorageFolderItem,
} from "@/types/storage";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

export const useStoragePage = () => {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<StorageFileItem[]>([]);
  const [folders, setFolders] = useState<StorageFolderItem[]>([]);
  const [selectedType, setSelectedType] = useState<StorageFileTypeFilter>("all");
  const [selectedFolder, setSelectedFolder] = useState<string>("root");
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");
  const [moveTargets, setMoveTargets] = useState<Record<number, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const classifyType = useCallback(
    (mimeType?: string): Exclude<StorageFileTypeFilter, "all"> => {
      if ((mimeType || "").startsWith("image/")) return "image";

      if (
        mimeType === "application/pdf" ||
        mimeType === "application/msword" ||
        (mimeType || "").startsWith("application/vnd.openxmlformats-officedocument") ||
        mimeType === "text/plain"
      ) {
        return "document";
      }

      return "other";
    },
    []
  );

  const loadData = useCallback(async () => {
    try {
      const [filesResponse, foldersResponse] = await Promise.all([
        getAllFilesService(),
        getFoldersService(),
      ]);

      setUploadedFiles(filesResponse || []);
      setFolders(foldersResponse || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      router.push("/login");
    }
  }, [router]);

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      try {
        setIsUploading(true);
        const selectedFiles = event.target.files;

        if (!selectedFiles || selectedFiles.length === 0) return;

        setFiles(Array.from(selectedFiles));

        const response = await uploadFiles(
          selectedFiles[0],
          selectedFolder === "root" ? null : selectedFolder
        );

        setUploadedFiles((oldFiles) => [...oldFiles, response]);
        setFiles([]);
      } catch (error: any) {
        const errorMessage = error?.message || "Falha ao fazer upload";
        setUploadError(errorMessage);
        setFiles([]);
      } finally {
        setIsUploading(false);
      }
    },
    [selectedFolder]
  );

  const handleCreateFolder = useCallback(async () => {
    try {
      const name = newFolderName.trim();
      if (!name) return;

      await createFolderService(name);
      setNewFolderName("");
      await loadData();
    } catch (error: any) {
      setUploadError(error?.message || "Falha ao criar pasta");
    }
  }, [newFolderName, loadData]);

  const handleRenameFolder = useCallback(async () => {
    try {
      const newName = renameFolderName.trim();
      if (selectedFolder === "root" || !newName) return;

      await renameFolderService(selectedFolder, newName);
      setSelectedFolder(newName);
      setRenameFolderName("");
      await loadData();
    } catch (error: any) {
      setUploadError(error?.message || "Falha ao renomear pasta");
    }
  }, [renameFolderName, selectedFolder, loadData]);

  const handleDeleteFolder = useCallback(async () => {
    try {
      if (selectedFolder === "root") return;

      const accepted = window.confirm(
        "Excluir esta pasta também excluirá os arquivos dela. Deseja continuar?"
      );

      if (!accepted) return;

      await deleteFolderService(selectedFolder);
      setSelectedFolder("root");
      await loadData();
    } catch (error: any) {
      setUploadError(error?.message || "Falha ao excluir pasta");
    }
  }, [selectedFolder, loadData]);

  const handleMoveFile = useCallback(
    async (fileId: number) => {
      try {
        const target = moveTargets[fileId] || "root";
        await moveFileService(fileId, target === "root" ? null : target);
        await loadData();
      } catch (error: any) {
        setUploadError(error?.message || "Falha ao mover arquivo");
      }
    },
    [moveTargets, loadData]
  );

  const handleDeleteFile = useCallback(
    async (fileId: number) => {
      try {
        const accepted = window.confirm("Deseja realmente excluir este arquivo?");
        if (!accepted) return;

        await deleteFileService(fileId);
        await loadData();
      } catch (error: any) {
        setUploadError(error?.message || "Falha ao excluir arquivo");
      }
    },
    [loadData]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem(getConstants().LOCAL_STORAGE_TOKEN);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);
    if (!token) {
      router.push("/login");
      return;
    }

    loadData();
  }, [router, loadData]);

  useEffect(() => {
    if (!uploadError) return;

    const timeId = setTimeout(() => {
      setUploadError("");
    }, 5000);

    return () => clearTimeout(timeId);
  }, [uploadError]);

  const filteredFiles = useMemo(() => {
    return uploadedFiles.filter((file) => {
      const typeMatches = selectedType === "all" || classifyType(file.mimeType) === selectedType;

      const folderMatches =
        selectedFolder === "root" ? !file.folderPath : file.folderPath === selectedFolder;

      return typeMatches && folderMatches;
    });
  }, [uploadedFiles, selectedType, selectedFolder, classifyType]);

  return {
    files,
    uploadedFiles,
    folders,
    selectedType,
    selectedFolder,
    newFolderName,
    renameFolderName,
    moveTargets,
    isUploading,
    uploadError,
    filteredFiles,
    classifyType,
    setSelectedType,
    setSelectedFolder,
    setNewFolderName,
    setRenameFolderName,
    setMoveTargets,
    handleChange,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleDeleteFile,
    handleMoveFile,
    handleLogout,
  };
};
