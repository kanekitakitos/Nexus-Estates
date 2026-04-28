"use client"

import { useState, useRef, useCallback } from 'react';
import Image from "next/image";
import { X, Loader2, UploadCloud, Trash2 } from 'lucide-react';
import axios from "axios";
import { notify } from "@/lib/notify"
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PropertyService } from "@/services/property.service";

// ─── Tipos e Props ────────────────────────────────────────────────────────

/** Parâmetros de assinatura para integração com Cloudinary via backend Nexus */
interface CloudinarySignatureParams {
    signature: string;
    timestamp: number;
    folder: string;
    api_key: string;
    cloud_name: string;
    upload_url: string;
}

/** Propriedades do Gestor de Média ImageInput */
export interface ImageInputProps {
    /** URL da imagem primária persistida */
    value?: string;
    /** Callback disparado após o upload bem-sucedido de um lote de imagens */
    onUploadComplete?: (imageUrls: string[]) => void;
    /** Callback para compatibilidade com campos de imagem única */
    onChange?: (imageUrl: string) => void;
    /** Protocolo de remoção da imagem primária */
    onRemove?: () => void;
    /** Extensão de estilo via classes Tailwind */
    className?: string;
}

// ─── Sub-Componentes Internos ───────────────────────────────────────────────

/**
 * AssetPreview - Visualização de alta fidelidade para o ativo primário persistido.
 */
function AssetPreview({ url, onRemove }: { url: string; onRemove?: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative aspect-video rounded-[32px] border-2 border-[#0D0D0D] bg-zinc-100 p-2 shadow-[8px_8px_0_0_#0D0D0D] dark:border-zinc-200 dark:bg-zinc-900 dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] overflow-hidden"
        >
            <div className="h-full w-full overflow-hidden rounded-[24px] relative">
                <Image
                    src={url}
                    alt="Asset Visual Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized={url.startsWith("blob:") || url.startsWith("data:")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Metadados Técnicos Overlay */}
                <div className="absolute top-4 left-4 font-mono text-[8px] font-black uppercase tracking-[0.2em] text-white/80 bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/20">
                    Nexus_Asset_Visual // Primary_Index
                </div>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                title="Eliminar Ativo"
                className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0D0D0D] bg-rose-500 text-white shadow-[3px_3px_0_0_#0D0D0D] transition-all hover:bg-rose-600 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:scale-95 z-20"
            >
                <Trash2 size={18} strokeWidth={2.5} />
            </button>
        </motion.div>
    )
}

/**
 * UploadDropzone - Interface cinética de captura de ficheiros via Drag & Drop ou Input.
 */
function UploadDropzone({ 
    onFiles, isDragOver, isUploading, onDragOver, onDragLeave, onDrop, inputRef 
}: { 
    onFiles: (files: File[]) => void
    isDragOver: boolean
    isUploading: boolean
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: () => void
    onDrop: (e: React.DragEvent) => void
    inputRef: React.RefObject<HTMLInputElement | null>
}) {
    return (
        <div
            className={cn(
                "relative border-2 border-dashed border-[#0D0D0D]/20 dark:border-white/10 rounded-[32px] overflow-hidden transition-all duration-500 min-h-[220px] flex flex-col items-center justify-center cursor-pointer group bg-[#FAFAF5] dark:bg-zinc-950/40",
                isDragOver ? "bg-primary/[0.05] border-primary opacity-100" : "hover:border-primary/40",
            )}
            onClick={() => !isUploading && inputRef.current?.click()}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragLeave={onDragLeave}
        >
            {/* Decoração de Grelha Técnica */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

            <input
                className="hidden"
                type="file"
                ref={inputRef}
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && onFiles(Array.from(e.target.files))}
                disabled={isUploading}
            />

            <div className="relative z-10 p-8 flex flex-col items-center text-center">
                <motion.div
                    animate={isDragOver ? { y: -5, scale: 1.1, rotate: 5 } : { y: 0, scale: 1, rotate: 0 }}
                    className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#0D0D0D] bg-white shadow-[4px_4px_0_0_#FF5E1A] dark:bg-zinc-800 transition-colors group-hover:bg-primary group-hover:text-white"
                >
                    <UploadCloud size={24} strokeWidth={2.5} className="group-hover:text-white" />
                </motion.div>

                <h3 className="font-serif text-2xl font-bold italic uppercase leading-none tracking-tighter text-[#0D0D0D] dark:text-white group-hover:text-primary transition-colors">
                    {isDragOver ? "Protocolo de Lançamento" : "Indexar Média //"}
                </h3>
                <p className="mt-3 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#8C7B6B]/60">
                    Nexus_Cloud_Gate // Integrador de Ativos
                </p>
            </div>

            {isUploading && (
                <div className="absolute inset-0 bg-white/85 dark:bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="mt-4 font-mono font-black uppercase text-[10px] tracking-[0.4em] text-primary">Sincronização em Curso...</span>
                </div>
            )}
        </div>
    )
}

/**
 * StagedGallery - Visualização temporária de ficheiros prestes a serem sincronizados.
 */
function StagedGallery({ 
    urls, onRemoveItem 
}: { 
    urls: string[]; 
    onRemoveItem: (i: number) => void 
}) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {urls.map((image, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative aspect-square rounded-2xl border-2 border-[#0D0D0D] overflow-hidden bg-white dark:bg-zinc-800 shadow-[4px_4px_0_0_#0D0D0D]"
                >
                    <Image
                        src={image}
                        alt={`Stage ${index}`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                        unoptimized={image.startsWith("blob:") || image.startsWith("data:")}
                    />
                    <div className="absolute top-2 left-2 font-mono text-[8px] font-black bg-black py-0.5 px-2 rounded text-white border border-white/20">
                        TMP_{index + 1}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemoveItem(index); }}
                        className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-xl border-2 border-black shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                        <X size={14} strokeWidth={3} />
                    </button>
                </motion.div>
            ))}
        </div>
    )
}

/**
 * GalleryControls - Ações globais para o lote de imagens em estágio.
 */
function GalleryControls({ 
    onSave, onClear, disabled 
}: { 
    onSave: () => void; 
    onClear: () => void; 
    disabled: boolean 
}) {
    return (
        <div className="flex gap-4 mt-8">
            <button
                onClick={onSave}
                disabled={disabled}
                className="flex-[2] bg-primary py-4 rounded-2xl font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white border-2 border-[#0D0D0D] shadow-[6px_6px_0_0_#0D0D0D] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
            >
                Confirmar Protocolo // Sincronizar
            </button>
            <button
                onClick={onClear}
                disabled={disabled}
                className="flex-1 px-8 py-4 bg-white border-2 border-[#0D0D0D] rounded-2xl font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#0D0D0D] shadow-[6px_6px_0_0_#0D0D0D] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all dark:bg-zinc-800 dark:border-white/20 dark:text-white"
            >
                Abortar
            </button>
        </div>
    )
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * ImageInput - Orquestrador de Ciclo de Vida de Média.
 * 
 * @description Providencia uma interface de alta fidelidade para indexação e 
 * upload de ativos visuais. Integra-se com o PropertyService para autorização
 * Cloudinary e oferece feedback visual imediato via staged galleries.
 */
export function ImageInput({ 
    value, 
    onUploadComplete, 
    onChange, 
    onRemove, 
    className 
}: ImageInputProps) {
    // Estados Operacionais
    const [stagedURLs, setStagedURLs] = useState<string[]>([])
    const [stagedFiles, setStagedFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)

    const uploadRef = useRef<HTMLInputElement>(null)

    // Handlers de Ficheiros
    const handleFilesIndex = useCallback((files: File[]) => {
        const filtered = files.filter(f => f.type.startsWith('image/'))
        
        filtered.forEach((f) => {
            setStagedFiles(prev => [...prev, f])
            setStagedURLs(prev => [...prev, URL.createObjectURL(f)])
        })
    }, [])

    const removeStaged = (index: number) => {
        setStagedFiles(prev => prev.filter((_, i) => i !== index))
        setStagedURLs(prev => prev.filter((_, i) => i !== index))
    }

    const clearStage = () => {
        setStagedFiles([])
        setStagedURLs([])
    }

    // Protocolo de Sincronização Cloudinary
    const handleSync = async () => {
        if (stagedFiles.length === 0) return
        setIsUploading(true)

        const uploadedUrls: string[] = []

        try {
            const params = await PropertyService.getUploadParams() as unknown as CloudinarySignatureParams

            if (!params.signature) {
                notify.error("Protocolo de segurança inválido.")
                return
            }

            for (const file of stagedFiles) {
                const formData = new FormData()
                formData.append("file", file)
                formData.append("timestamp", String(params.timestamp))
                formData.append("api_key", params.api_key)
                formData.append("signature", params.signature)
                formData.append("folder", params.folder)

                const response = await axios.post(params.upload_url, formData)
                uploadedUrls.push(response.data.secure_url)
            }

            notify.success(`Protocolo ${uploadedUrls.length} finalizado.`)
            clearStage()

            if (onUploadComplete) onUploadComplete(uploadedUrls)
            if (onChange && uploadedUrls.length > 0) onChange(uploadedUrls[0])

        } catch (error) {
            console.error("Cloudinary Sync Err:", error)
            notify.error("Falha na sincronização Nexus_Cloud.")
        } finally {
            setIsUploading(false)
        }
    }

    // Drag & Drop Handlers
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        if (e.dataTransfer.files) handleFilesIndex(Array.from(e.dataTransfer.files))
    }

    return (
        <div className={cn("space-y-6", className)}>
            {/* Antevisão Primária */}
            <AnimatePresence mode="wait">
                {value && stagedURLs.length === 0 && (
                    <AssetPreview url={value} onRemove={onRemove} />
                )}
            </AnimatePresence>

            {/* Zona de Drop Kinética */}
            <UploadDropzone 
                inputRef={uploadRef}
                isDragOver={isDragOver}
                isUploading={isUploading}
                onFiles={handleFilesIndex}
                onDragOver={onDragOver}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
            />

            {/* Contentor de Estágio (Imagens Temporárias) */}
            <AnimatePresence>
                {stagedURLs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="p-8 bg-zinc-50 border-2 border-[#0D0D0D] rounded-[40px] shadow-[16px_16px_0_0_#0D0D0D] dark:border-white/20 dark:bg-zinc-900"
                    >
                        <div className="flex items-center gap-2 mb-6 ml-1">
                             <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                             <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-primary">
                                Status: Estágio_Temporário // {stagedURLs.length} Ficheiros
                             </span>
                        </div>

                        <StagedGallery urls={stagedURLs} onRemoveItem={removeStaged} />
                        
                        <GalleryControls 
                            onSave={handleSync} 
                            onClear={clearStage} 
                            disabled={isUploading} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
