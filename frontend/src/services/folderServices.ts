import { getConstants } from "@/constants";

const makeHeaders = () => {
  const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

export const getFoldersService = async () => {
  const { url } = getConstants();

  const response = await fetch(`${url}/folders`, {
    method: "GET",
    headers: makeHeaders(),
  });

  const data = await response.json();
  if (data.message) throw new Error(data.message);

  return data.folders || [];
};

export const createFolderService = async (name: string) => {
  const { url } = getConstants();

  const response = await fetch(`${url}/folders`, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify({ name }),
  });

  const data = await response.json();
  if (data.message) throw new Error(data.message);

  return data.folder;
};

export const renameFolderService = async (oldName: string, newName: string) => {
  const { url } = getConstants();

  const response = await fetch(`${url}/folders/rename`, {
    method: "PATCH",
    headers: makeHeaders(),
    body: JSON.stringify({ oldName, newName }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Falha ao renomear pasta");
  }
};

export const deleteFolderService = async (name: string) => {
  const { url } = getConstants();

  const response = await fetch(`${url}/folders/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: makeHeaders(),
  });

  const data = await response.json();
  if (data.message) throw new Error(data.message);

  return data;
};

export const moveFileService = async (fileId: number, folderPath?: string | null) => {
  const { url } = getConstants();

  const response = await fetch(`${url}/files/${fileId}/move`, {
    method: "PATCH",
    headers: makeHeaders(),
    body: JSON.stringify({ folderPath: folderPath || null }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Falha ao mover arquivo");
  }
};
