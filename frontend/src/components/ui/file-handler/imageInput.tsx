"use client"

/**
 * ImageInput - Gestor de Upload e Visualização de Média Nexus
 * 
 * Componente avançado que suporta drag & drop, múltiplas imagens,
 * integração com Cloudinary (via PropertyService) e estética Neo-Brutal.
 */

import { useState, useRef, useEffect } from 'react';
import { Camera, Check, X, Loader2, UploadCloud, Trash2 } from 'lucide-react';
import { BrutalButton } from "@/components/ui/forms/button";
import axios from "axios";
import { toast } from "sonner";
import { PropertyService } from "@/services/property.service";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CloudinarySignatureParams {
    signature: string;
    timestamp: number;
    folder: string;
    api_key: string;
    cloud_name: string;
    upload_url: string;
}

interface ImageInputProps {
    /** URL da imagem atual (se aplicável) */
    value?: string;
    /** Callback chamado após conclusão do upload */
    onUploadComplete?: (imageUrls: string[]) => void;
    /** Callback chamado individualmente para novas imagens (compatibilidade) */
    onChange?: (imageUrl: string) => void;
    /** Callback para remover a imagem atual */
    onRemove?: () => void;
    /** Classes CSS adicionais */
    className?: string;
}

const imageTypeAllowed: Set<string> = new Set<string>();

export function ImageInput({ value, onUploadComplete, onChange, onRemove, className }: ImageInputProps) {
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
            const paramsRecord = await PropertyService.getUploadParams();
            const params = paramsRecord as unknown as CloudinarySignatureParams;

            if (!params.signature || !params.folder) {
                toast.error("Parâmetros de upload inválidos.");
                setIsUploading(false);
                return;
            }

            for (const file of imagesFiles) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("timestamp", String(params.timestamp));
                formData.append("api_key", params.api_key);
                formData.append("signature", params.signature);
                formData.append("folder", params.folder);

                const response = await axios.post(params.upload_url, formData);
                uploadedUrls.push(response.data.secure_url);
            }

            toast.success(`${uploadedUrls.length} imagens sincronizadas!`);
            setImagesFiles([]);
            setImagesURL([]);

            if (onUploadComplete) {
                onUploadComplete(uploadedUrls);
            }
            if (onChange && uploadedUrls.length > 0) {
                onChange(uploadedUrls[0]);
            }

        } catch (error) {
            console.error("Erro no upload:", error);
            toast.error("Falha no upload das imagens.");
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
        <div className={cn("space-y-4", className)}>
            {/* Display de Imagem Atual (se disponível) */}
            <AnimatePresence>
                {value && imagesURL.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="relative aspect-video rounded-2xl border-2 border-foreground overflow-hidden shadow-[4px_4px_0_0_#0D0D0D] group"
                    >
                        <img src={value} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                            title="Remover Imagem"
                            className="absolute top-3 right-3 p-2 bg-rose-500 text-white rounded-lg border-2 border-foreground shadow-[2px_2px_0_0_#0D0D0D] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                        >
                            <Trash2 size={16} strokeWidth={3} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className={cn(
                    "relative border-4 border-foreground rounded-2xl overflow-hidden transition-all duration-300",
                    "bg-white/40 dark:bg-black/20 backdrop-blur-md",
                    "cursor-pointer group",
                    isDragOver ? "scale-[0.98] border-primary ring-4 ring-primary/20" : "hover:scale-[0.99]",
                    "shadow-[8px_8px_0_0_#0D0D0D] dark:shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]"
                )}
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

                <div className="p-8 flex flex-col items-center justify-center min-h-[160px]">
                    <motion.div
                        animate={isDragOver ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
                        className="bg-primary p-4 rounded-xl border-2 border-foreground shadow-[3px_3px_0_0_#0D0D0D] mb-4"
                    >
                        <UploadCloud size={30} className="text-primary-foreground" />
                    </motion.div>

                    <h3 className="text-lg font-black uppercase tracking-tighter text-center leading-none">
                        {isDragOver ? "Largue para Carregar" : "Carregar Média //"}
                    </h3>
                    <p className="text-[9px] font-mono font-black uppercase opacity-40 mt-1 tracking-[0.2em]">
                        {imagesFiles.length > 0 ? `${imagesFiles.length} Ficheiros Prontos` : "Nexus_Integrator Protocol"}
                    </p>
                </div>

                {isUploading && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <span className="mt-4 font-mono font-black uppercase text-xs">A SINCRO...</span>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {imagesURL.length > 0 && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 bg-white/20 dark:bg-black/10 backdrop-blur-md border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_#0D0D0D]"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            {imagesURL.map((image, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group relative aspect-square rounded-xl border-2 border-foreground overflow-hidden shadow-[4px_4px_0_0_#0D0D0D]"
                                >
                                    <img
                                        src={image}
                                        alt={`Preview ${index}`}
                                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-300"
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                        title="Remover Seleção"
                                        className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-md border-2 border-foreground shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-4">
                            <BrutalButton
                                onClick={handleSave}
                                disabled={isUploading}
                                className="flex-1 py-3 text-[10px] uppercase font-black"
                            >
                                Confirmar Upload
                            </BrutalButton>
                            <button
                                onClick={handleClear}
                                disabled={isUploading}
                                className="px-4 py-2 bg-rose-500 text-white border-2 border-foreground rounded-xl shadow-[3px_3px_0_0_#0D0D0D] font-mono text-[10px] font-black uppercase"
                            >
                                Limpar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
