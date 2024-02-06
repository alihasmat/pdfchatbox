"use client"
import { useEffect, useState } from "react"
import { Loader2, Send, Trash } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {useChat} from "ai/react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Message } from "ai"
import MessageList from "./MessageList"
import {useRouter} from "next/navigation"



type Props = {
    chatId: number,
}

export default function ChatComponent({ chatId }: Props) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false)

    const {data, isLoading} = useQuery({
        queryKey: ["chat", chatId],
        queryFn: async () => {
            const response = await axios.post<Message[]>("/api/get-messages", {
                chatId,
              });
              return response.data;
        }
    })

    const {input, handleInputChange, handleSubmit, messages} = useChat({
        api: "/api/chat",
        body: {
            chatId,
        },
        initialMessages: data || [],
    })

    useEffect(() => {
        const messageContainer = document.getElementById("message-container");
        if (messageContainer) {
          messageContainer.scrollTo({
            top: messageContainer.scrollHeight,
            behavior: "smooth",
          });
        }
      }, [messages]);

     
      async function handleDelete() {
        try {
            setIsDeleting(true)
    
            await axios.delete('/api/delete-chat', { data: { chatId } });
            
            const nextChatId = chatId - 1;

        if (nextChatExists(nextChatId)) {
            router.push(`/chat/${nextChatId}`);
            router.refresh(); // You might not need this line depending on your use case
        } else {
            router.push('/');
        }
            
        } catch (error) {
            console.error('Error deleting chat:', error);
        } finally {
            setIsDeleting(false);
        }
    }

    // Function to check if the next chat exists
  function nextChatExists(nextChatId: number): boolean {
    // Replace this with your specific logic to check if the next chat ID exists
    // For example, check if the nextChatId is within a valid range or exists in your database
    // Return true if the next chat exists, otherwise return false
    return true;
  }


    return (
        <div className="relative max-h-screen overflow-scroll"
        id="message-container">
            {/* header */}
            <div className="flex sticky top-0 inset-x-0 p-2 bg-white h-fit">
                <h3 className="text-xl font-bold flex-1">Chat</h3>
                <button onClick={handleDelete}  disabled={isDeleting} type="button">
                    {isDeleting ? (
                        <Loader2 className="w-4 h-6 mr-4"/>
                        ): (
                        <Trash className="w-4 h-6 mr-4"/>
                    )}
                </button>
            </div>

            {/* message list */}
            <MessageList messages={messages} isLoading={isLoading} />
            
            {/* Input form */}
            <form onSubmit={handleSubmit} className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white">
                <div className="flex">
                    <Input 
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask any question..."
                        className="w-full"
                    />
                    <Button className="bg-blue-600 ml-2"><Send className="h-4 w-4" /></Button>
                </div>

            </form>

        </div>
    )
}