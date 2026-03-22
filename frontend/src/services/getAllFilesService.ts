import { getConstants } from "@/constants";

type GetAllFilesFilters = {
  type?: "image" | "document" | "other";
  folder?: string | null;
};

export const getAllFilesService = async (filters?: GetAllFilesFilters) => {
  const { url } = getConstants();

  const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

  const params = new URLSearchParams();
  if (filters?.type) {
    params.set("type", filters.type);
  }
  if (filters?.folder !== undefined) {
    params.set("folder", filters.folder === null ? "root" : filters.folder);
  }

  const queryString = params.toString();
  const endpoint = queryString ? `${url}/files?${queryString}` : `${url}/files`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.message) throw new Error(data.message);

  return data.files;
};
