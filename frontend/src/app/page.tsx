"use client";

import { useStoragePage } from "@/hooks/useStoragePage";
import { makeLinkRedirect } from "@/helper/makeLinkRedirect";
import { truncateString } from "@/helper/truncateString";
import { StorageFileTypeFilter } from "@/types/storage";

export default function Home() {
    const {
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
    } = useStoragePage();

    return (
        <main className="flex h-screen flex-col bg-gray-50">
            <header className="bg-gradient-to-r from-amber-500 to-amber-600 w-full h-16 flex items-center justify-between px-6 shadow-md">
                <div className="flex items-center">
                    <h1 className="font-bold text-2xl text-white">
                        📁 Simple Storage
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-white text-sm">
                        Total de arquivos: {uploadedFiles.length}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium"
                    >
                        Sair
                    </button>
                </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {uploadError && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700 text-sm">
                                {uploadError}
                            </p>
                        </div>
                    )}

                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Meus Arquivos
                    </h2>

                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <select
                                value={selectedType}
                                onChange={(event) =>
                                    setSelectedType(
                                        event.target
                                            .value as StorageFileTypeFilter,
                                    )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">Todos os tipos</option>
                                <option value="image">Imagem</option>
                                <option value="document">Documento</option>
                                <option value="other">Outros</option>
                            </select>

                            <select
                                value={selectedFolder}
                                onChange={(event) =>
                                    setSelectedFolder(event.target.value)
                                }
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="root">Raiz</option>
                                {folders.map((folder) => (
                                    <option key={folder.id} value={folder.name}>
                                        {folder.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                value={newFolderName}
                                onChange={(event) =>
                                    setNewFolderName(event.target.value)
                                }
                                placeholder="Nova pasta"
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <button
                                onClick={handleCreateFolder}
                                className="px-3 py-2 bg-amber-500 text-white rounded-md text-sm"
                            >
                                Criar pasta
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <input
                                value={renameFolderName}
                                onChange={(event) =>
                                    setRenameFolderName(event.target.value)
                                }
                                placeholder="Novo nome da pasta selecionada"
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                disabled={selectedFolder === "root"}
                            />
                            <button
                                onClick={handleRenameFolder}
                                disabled={selectedFolder === "root"}
                                className="px-3 py-2 bg-blue-500 disabled:bg-gray-300 text-white rounded-md text-sm"
                            >
                                Renomear pasta
                            </button>
                            <button
                                onClick={handleDeleteFolder}
                                disabled={selectedFolder === "root"}
                                className="px-3 py-2 bg-red-500 disabled:bg-gray-300 text-white rounded-md text-sm"
                            >
                                Excluir pasta
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {files.map((file) => (
                            <div
                                key={file.name}
                                className="bg-white border-2 border-blue-300 rounded-lg p-4 flex flex-col items-center justify-center h-40 shadow-sm animate-pulse"
                            >
                                <div className="text-blue-500 text-3xl mb-2">
                                    ⏳
                                </div>
                                <p className="text-sm text-center text-gray-600 mb-2">
                                    {truncateString(file.name, 20)}
                                </p>
                                <p className="text-xs text-blue-500">
                                    Carregando...
                                </p>
                            </div>
                        ))}

                        {filteredFiles.map((file) => (
                            <div
                                key={file.id}
                                className="bg-white border-2 border-green-300 hover:border-green-400 rounded-lg p-4 flex flex-col items-center justify-center h-52 shadow-sm hover:shadow-md transition-all duration-200 group"
                            >
                                <div className="text-green-500 text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                                    📄
                                </div>
                                <p className="text-sm text-center text-gray-700 font-medium">
                                    {truncateString(
                                        file.fileName?.split("_")[2] ||
                                            file.fileName,
                                        20,
                                    )}
                                </p>
                                <p className="text-xs text-green-600 mt-1 mb-2">
                                    {file.folderPath || "Raiz"} •{" "}
                                    {classifyType(file.mimeType)}
                                </p>
                                <div className="flex flex-row gap-2">
                                    <button
                                        onClick={() =>
                                            window.open(
                                                makeLinkRedirect(file.fileName),
                                                "_blank",
                                            )
                                        }
                                        className="text-xs bg-green-100 text-green-700 hover:bg-green-300 px-2 py-1 rounded-md"
                                    >
                                        Abrir
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteFile(file.id)
                                        }
                                        className="text-xs bg-red-100 text-red-700 hover:bg-red-300 px-2 py-1 rounded-md"
                                    >
                                        Excluir
                                    </button>
                                </div>
                                <div className="flex w-full gap-1 mt-2">
                                    <select
                                        value={moveTargets[file.id] || "root"}
                                        onChange={(event) =>
                                            setMoveTargets((oldValue) => ({
                                                ...oldValue,
                                                [file.id]: event.target.value,
                                            }))
                                        }
                                        className="text-xs border border-gray-300 rounded-md px-1 py-1 w-full"
                                    >
                                        <option value="root">Raiz</option>
                                        {folders.map((folder) => (
                                            <option
                                                key={folder.id}
                                                value={folder.name}
                                            >
                                                {folder.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleMoveFile(file.id)}
                                        className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-2 rounded-md"
                                    >
                                        Mover
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="bg-white border-2 border-dashed border-amber-400 hover:border-amber-500 rounded-lg p-4 flex flex-col items-center justify-center h-40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-amber-50 group">
                            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                {isUploading ? (
                                    <>
                                        <div className="text-amber-500 text-3xl mb-2 animate-spin">
                                            ⚙️
                                        </div>
                                        <p className="text-sm text-center text-amber-600 font-medium">
                                            Enviando arquivo...
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-amber-500 text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                                            📤
                                        </div>
                                        <p className="text-sm text-center text-gray-600 font-medium mb-1">
                                            Adicionar arquivo
                                        </p>
                                        <p className="text-xs text-center text-gray-500">
                                            Clique para selecionar
                                        </p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    name="file"
                                    className="hidden"
                                    onChange={handleChange}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                    </div>

                    {filteredFiles.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl text-gray-300 mb-4">
                                📁
                            </div>
                            <p className="text-xl text-gray-500 mb-2">
                                Nenhum arquivo encontrado
                            </p>
                            <p className="text-gray-400">
                                Comece fazendo upload do seu primeiro arquivo!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
