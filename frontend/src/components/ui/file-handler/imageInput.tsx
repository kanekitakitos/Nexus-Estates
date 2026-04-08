"use client"
import { useState, useRef } from 'react';
import { Camera, Check, X, Loader2 } from 'lucide-react';
import { BrutalButton } from "@/components/ui/forms/button";
import axios from "axios";
import { toast } from "sonner";
import { PropertyService } from "@/services/property.service";

// Estrutura que o teu backend Java devolve
interface CloudinarySignatureParams {
    signature: string;
    timestamp: number;
    folder: string; // <-- O teu Java usa "folder" e não "upload_preset"
    api_key: string;
    cloud_name: string;
    upload_url: string; // <-- O teu Java já te dá o URL certinho!
}

interface ImageInputProps {
    onUploadComplete?: (imageUrls: string[]) => void;
}

const imageTypeAllowed: Set<string> = new Set<string>();

export function ImageInput({ onUploadComplete }: ImageInputProps) {
    const [imagesURL, setImagesURL] = useState<string[]>([]);
    const [imagesFiles, setImagesFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);

    const uploadRef = useRef<HTMLInputElement>(null);

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setImagesFiles([]);
        setImagesURL([]);
    };

    const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        if (imagesFiles.length === 0) return;

        setIsUploading(true);
        const uploadedUrls: string[] = [];

        try {
            // 1. Pedir a assinatura ao backend Java
            const paramsRecord = await PropertyService.getUploadParams();
            const params = paramsRecord as unknown as CloudinarySignatureParams;

            if (!params.signature || !params.folder) {
                toast.error("O servidor não devolveu os parâmetros de upload corretos.");
                setIsUploading(false);
                return;
            }

            // 2. Fazer upload de cada ficheiro um a um de forma segura
            for (const file of imagesFiles) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("timestamp", String(params.timestamp));
                formData.append("api_key", params.api_key);
                formData.append("signature", params.signature);
                formData.append("folder", params.folder); // O parâmetro exato que o Java assinou

                // Usamos o URL direto que o Java gerou
                const response = await axios.post(params.upload_url, formData);

                uploadedUrls.push(response.data.secure_url);
            }

            toast.success(`${uploadedUrls.length} imagens carregadas com sucesso!`);

            // Limpa a UI depois do upload
            setImagesFiles([]);
            setImagesURL([]);

            // 3. Devolve os URLs para a Galeria usar (se a função foi passada)
            if (onUploadComplete) {
                onUploadComplete(uploadedUrls);
            }

        } catch (error) {
            console.error("Erro no upload:", error);
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 400) toast.error("Upload Rejeitado. Verifica se a pasta existe no Cloudinary.");
                else if (status === 401) toast.error("Não autorizado: Assinatura inválida.");
                else toast.error("Falha ao comunicar com o servidor de imagens.");
            } else {
                toast.error("Ocorreu um erro inesperado no upload.");
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleFileFromDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
            handleImages(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileFromInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        handleImages(Array.from(e.target.files));
    };

    const handleImages = (files: File[]) => {
        const filteredFiles = files.filter(file => {
            return file.type.startsWith('image/')
                && (imageTypeAllowed.size === 0 || imageTypeAllowed.has(file.type.substring(6)));
        });

        filteredFiles.forEach((f) => {
            setImagesFiles(prev => [...prev, f]);
            setImagesURL(prev => [...prev, URL.createObjectURL(f)]);
        });
    };

    const removeImage = (index: number) => {
        setImagesFiles(prev => prev.filter((_, i) => i !== index));
        setImagesURL(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div
            className={`relative border-[7px] cursor-pointer transition-all duration-150 border-black ${isDragOver ? 'bg-orange-100' : 'bg-white hover:bg-orange-50'}`}
            style={{ boxShadow: '12px 12px 0px 0px #000' }}
            onClick={() => !isUploading && uploadRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleFileFromDrop}
            onDragLeave={() => setIsDragOver(false)}
        >
            <input
                className="hidden"
                type="file"
                ref={uploadRef}
                accept="image/*"
                multiple
                onChange={handleFileFromInput}
                disabled={isUploading}
            />

            <div className={imagesFiles.length > 0 ? "p-6 pb-2" : "p-6"}>
                <div className="border-[2px] border-dashed border-black p-12 flex flex-col items-center">
                    <div
                        className="border-[6px] border-black bg-orange-400 p-6 mb-6"
                        style={{ boxShadow: '6px 6px 0px 0px #000', transform: 'rotate(2deg)' }}
                    >
                        <Camera size={56} strokeWidth={2.5} />
                    </div>

                    <h2 className="md:text-3xl text-md font-bold uppercase mb-3 text-center">
                        &lt; DRAG IMAGES HERE &gt;
                    </h2>
                    <p className="md:text-lg text-sm font-bold uppercase text-gray-700">
                        ** CLICK TO BROWSE **
                    </p>

                    {imagesFiles.length > 0 && (
                        <div
                            className="mt-6 border-[5px] border-black bg-green-400 px-6 py-3 flex items-center gap-2"
                            style={{ boxShadow: '4px 4px 0px 0px #000' }}
                        >
                            <Check size={20} strokeWidth={4} />
                            <span className="font-black uppercase">
                              {imagesFiles.length} FILES LOADED
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {imagesFiles.length > 0 && (
                <div className="flex justify-around px-10 gap-x-5 mt-4">
                    <BrutalButton
                        onClick={handleSave}
                        disabled={isUploading}
                        className={isUploading ? "opacity-50 flex gap-2 items-center" : ""}
                    >
                        {isUploading ? <><Loader2 className="animate-spin" /> UPLOADING...</> : "SAVE IMAGES"}
                    </BrutalButton>

                    <BrutalButton onClick={handleClear} disabled={isUploading} className="bg-destructive">
                        CLEAR
                    </BrutalButton>
                </div>
            )}

            {imagesURL.length > 0 && (
                <div className="mt-4 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-10">
                        {imagesURL.map((image, index) => (
                            <div
                                key={index}
                                className="relative border-[6px] border-black bg-white"
                                style={{
                                    boxShadow: '8px 8px 0px 0px #000',
                                    transform: index % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)'
                                }}
                            >
                                <img
                                    src={image}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-32 md:h-48 object-cover"
                                />
                                <div className="absolute top-3 left-3 border-[4px] border-black bg-orange-400 px-3 py-1">
                                    <p className="font-black text-sm">#{index + 1}</p>
                                </div>
                                {!isUploading && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(index);
                                        }}
                                        className="absolute top-3 right-3 border-[4px] border-black bg-red-500 p-2 hover:bg-red-600"
                                        style={{ boxShadow: '4px 4px 0px 0px #000' }}
                                    >
                                        <X size={20} strokeWidth={3} className="text-white" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}