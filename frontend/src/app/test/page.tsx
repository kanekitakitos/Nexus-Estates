"use client"
import {ImageInput} from "@/components/ui/file-handler/imageInput"
import {BrutalButton} from "@/components/ui/forms/button";
import {propertiesAxios} from "@/lib/axiosAPI"

export default function test(){
    return(
        <div>
            <ImageInput/>
           <BrutalButton className={"w-full"}
                         onClick={()=>
                             propertiesAxios.get("/upload-params")
                             .then((e)=>console.log(e))}
           >
                get upload-parametros
           </BrutalButton>
        </div>
    )
}