"use client"
import { useState, useEffect } from 'react';
import { Loader2, Inbox } from "lucide-react";
import {useDropzone} from 'react-dropzone'
import uploadToS3 from "@/lib/s3";
import {toast} from "react-hot-toast"
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function FileUpload() {
  const router = useRouter()

  const [uploading, setUploading] = useState(false)
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ file_key, file_name }: { file_key: string; file_name: string }) => {
      const response = await axios.post('/api/create-chat', {
        file_name,
        file_key,
      });
      return response.data;
    }
    });
  

    const {getInputProps, getRootProps} = useDropzone({
        accept: {"application/pdf": [".pdf"]},
            maxFiles: 1,
            onDrop: async (acceptedFiles) => {
              // console.log(acceptedFiles)
              const file = acceptedFiles[0];
              if(file.size > 10 * 1024 *1024) {
                toast.error("File too large");
                return;
              }

              try {
                setUploading(true);
                const data = await uploadToS3(file)
                if(!data?.file_key || !data.file_name) {
                  toast.error("something went wrong");
                  return;
                }
                mutate(data, {
                  onSuccess: ({chat_id}) => {
                    toast.success("chat created")
                    router.push(`/chat/${chat_id}`)
                    router.refresh();
                  },
                  onError: (error) => {
                    console.error(error)
                  }

                })
              } catch (error) {
                  console.log(error)
              }finally {
                setUploading(false)
              }

            }
      })

    return (
        <div className="p-2 bg-white rounded-xl w-full mt-2">
          <div {...getRootProps({
                className: "py-8 flex flex-col justify-center items-center border-2 border-dashed rounded-xl bg-gray-50 cursor-pointer"
            })}>
            <input {...getInputProps()}/>
            {uploading || isPending ? (
              <>
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="mt-2 text-sm text-slate-400">Spilling Tea to GPT...</p>
              </>
            ): (
              <>
                <Inbox className="w-10 h-10 text-blue-500"/>
                <p className="mt-2 text-sm text-slate-400">Drop PDF here</p>
              </>
            )}
           </div>
      </div>
    )
}