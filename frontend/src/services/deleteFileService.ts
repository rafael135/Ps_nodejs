import { getConstants } from "@/constants";

export const deleteFileService = async (fileId: number) => {
	const { url } = getConstants();
	const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);

	const response = await fetch(`${url}/files/${fileId}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
		},
	});

	const data = await response.json();

	if (!response.ok || data.message) {
		throw new Error(data.message || "Falha ao excluir arquivo");
	}

	return data.file;
};
