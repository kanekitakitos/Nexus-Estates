"use server"

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function getCloudinarySignature() {
    const timestamp: string = String(Math.round(new Date().getTime() / 1000))

    const api_secret: string = process.env.CLOUDINARY_API_SECRET || ""
    if (api_secret == "")
        console.error("api_secret não defenida nas variaveis de ambiente")


    const upload_preset: string = process.env.CLOUDINARY_UPLOAD_PRESET || ""
    if(upload_preset == "")
        console.error("upload_preset nao foi defenida como variavel do sistema")

    const signature:string = cloudinary.utils.api_sign_request(
        {
            timestamp: timestamp,
            upload_preset: upload_preset
        },
        api_secret
    )

    console.log({
        "upload_preset": upload_preset,
        "api_secret": api_secret
    })


    return { signature, timestamp, upload_preset};
}