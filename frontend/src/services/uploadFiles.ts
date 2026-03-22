import { getConstants } from "@/constants";
import { StorageFileItem } from "@/types/storage";

export const uploadFiles = async (file: any, folderPath?: string | null) => {
  if (!file) throw Error("Files not Found");

  const { url } = getConstants();

  const formData = new FormData();
  formData.append("file", file);
  if (folderPath) {
    formData.append("folderPath", folderPath);
  }

  const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

  const response = await fetch(`${url}/file/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (data.message) throw new Error(data.message);

  return data.file as StorageFileItem;
};
