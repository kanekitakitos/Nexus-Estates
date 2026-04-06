"use client"
import {useState, useRef, useEffect} from 'react';
import {Camera, Check, X} from 'lucide-react'
import {BrutalButton} from "@/components/ui/forms/button";
import axios from "axios"
import {AxiosError, AxiosResponse} from "axios";
import {toast} from "sonner";
import {getCloudinarySignature} from "@/../signatureCreat"

/**
 * tipos de imagens permitidas
 *
 * se estiver vasio, todos os tipos são permitidos
 */
const imageTypeAllowed:Set<string> = new Set<string>()

function ImageInput(){
    const [imagesURL, setImagesURL] = useState<string[]>([]);
    const [imagesFiles, setImagesFiles] = useState<File[]>([]);

    const handleClear = async (e :React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()

        setImagesFiles((prev)=>([]))
        setImagesURL(prev => ([]))
    }

    const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()

        try{

            const api_key:string = process.env.CLOUDINARY_PUBLIC_API_KEY || ""
            if(api_key == "")
                console.error("api_key nao foi defenida como variavel do sistema")


            const upload_preset:string = process.env.CLOUDINARY_UPLOAD_PRESET || ""
            if(upload_preset == "")
                console.error("upload_preset nao foi defenida como variavel do sistema")


            imagesFiles.forEach(async (file)=>{
            const {signature, timestamp} :{signature:string, timestamp:number} = await getCloudinarySignature()

            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", upload_preset)
            formData.append("timestamp", timestamp.toString())
            formData.append("api_key", api_key)
            formData.append("signature", signature)

            console.log({
                "upload_preset" : upload_preset,
                "api_key": api_key,
                "signature" : signature
            })


            axios.post("https://api.cloudinary.com/v1_1/dw4lcrxn7/image/upload", formData)
                .then((e:AxiosResponse)=> {
                    toast.warning("Images Uploadod Suscess")
                    console.log(e)
            }).catch((err:AxiosError)=> {
                const respostas : Map<number, string> = new Map<number, string>()
                respostas.set(400,"Bad Request\nUpload preset must be specified when using unsigned upload")
                respostas.set(404, "No conection to server")
                respostas.set(401, "Assinatura com dados invalidos.")


                if(err.status != undefined && respostas.has(err.status))
                    toast.warning(respostas.get(err.status))
                else {
                    toast.warning("Updload Fail\nError " + err.status != undefined ? err.status : "undefined")
                }

                console.log(err)
            })
        })
        }catch (e){
            console.log(e)
        }
    }

    const [isDragOver, setIsDragOver] = useState<boolean>(false)

    const uploadRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent<HTMLDivElement> )=>{
        // impede abrir no browser
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleFileFromDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files) {
            const files: File[] = Array.from(e.dataTransfer.files);
            handleImages(files);
        }
    };

    const handleFileFromInput = (e: React.ChangeEvent<HTMLInputElement>) =>{
        if (!e.target.files)
            return
        const files:File[] = Array.from(e.target.files);

        handleImages(files)
    }

    const handleImages = (files : File[])=>{
        console.log("FILERING ---------------")
        // filtra para ser só imagens
        files = files.filter(file => {
                console.log(file.type)
                return file.type.startsWith('image/')
                    && (imageTypeAllowed.size == 0 || imageTypeAllowed.has(file.type.substring(6)));
            }
        )

        console.log(`FILES OUT (${files.length}) ---------------`)
        files.forEach((f)=>{
            setImagesFiles(prev => [...prev, f])
            setImagesURL(prev => [...prev, URL.createObjectURL(f)])
            console.log(f)
        })
    }

    const removeImage = (index: number) => {
        setImagesFiles(prev => prev.filter((_, i) => i !== index));
        setImagesURL(prev => prev.filter((_, i) => i !== index));
    };


    return(
        <div className={"relative border-[7px] cursor-pointer transition-all duration-150" +
            "border-black bg-white hover:bg-orange-50"}
             style={{
                 boxShadow: '12px 12px 0px 0px #000',
                 // transform: isDragging ? 'rotate(1deg)' : 'rotate(0deg)'
             }}
             onClick={()=>uploadRef.current?.click()}
             onDragOver={handleDragOver}
             onDrop={handleFileFromDrop}
             onDragLeave={()=>setIsDragOver(false)}
        >

            <input className={"hidden"}
                   type={"file"}
                   ref={uploadRef}
                   accept={"image/*"}
                   onChange={handleFileFromInput}
            />

            <div className={imagesFiles.length > 0? "p-6 pb-2" : "p-6"}>
                <div className={"border-[2px] border-dashed border-black p-12 flex flex-col items-center"}>
                    <div
                        className="border-[6px] border-black bg-orange-400 p-6 mb-6"
                        style={{
                            boxShadow: '6px 6px 0px 0px #000',
                            transform: 'rotate(2deg)'
                        }}
                    >
                        <Camera size={56} strokeWidth={2.5} />
                    </div>

                    <h2 className={"md:text-3xl text-md font-bold uppercase mb-3 text-center"}>
                        &lt; DRAG MORE IMAGE HERE &gt;
                    </h2>
                    <p className={"md:text-lg text-sm font-bold uppercase text-gray-700"}>
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
                <div className={"flex justify-around px-10 gap-x-5"}>
                    <BrutalButton onClick={handleSave}>
                        SAVE
                    </BrutalButton>

                    <BrutalButton onClick={handleClear}>
                        CLEAR
                    </BrutalButton>
                </div>
            )}
            {imagesURL.length > 0 && (
                <div className="mt-2 mb-6">
                    <div className="grid grid-cols-3 gap-4 px-10">
                        {imagesURL.map((image, index)=>(
                            <div key={index}className="relative border-[6px] border-black bg-white"
                                 style={{
                                     boxShadow: '8px 8px 0px 0px #000',
                                     transform: index % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)'
                                 }}
                            >
                                <img
                                    src={image}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-3 left-3 border-[4px] border-black bg-orange-400 px-3 py-1">
                                    <p className="font-black text-sm">
                                        #{index + 1}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                    className="absolute top-3 right-3 border-[4px] border-black bg-red-500 p-2
                           hover:bg-red-600"
                                    style={{ boxShadow: '4px 4px 0px 0px #000' }}
                                >
                                    <X size={20} strokeWidth={3} className="text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export {ImageInput}