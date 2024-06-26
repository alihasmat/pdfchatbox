import ChatSideBar from "@/components/ChatSideBar";
import PdfViewer from "@/components/PdfViewer";
import ChatComponent from "@/components/ChatComponent";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";


type Props = {
    params: {
        chatId: string,
    }
}

const ChatPage = async ({params: {chatId}}: Props) => {
    const {userId} = auth();

    if(!userId) {
        return redirect("/sign-in");
    }

    const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
    if(!_chats) {
       return redirect("/")
    }

    if(!_chats.find((chat) => chat.id === parseInt(chatId))) {
        return redirect("/")
    }

    const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
    const isPro = await checkSubscription();

    return (
        <div className="flex max-h-screen overflow-scroll">
            <div className="flex w-full max-h-screen overflow-scroll">
                <div className="flex-[1] max-w-44 sm:max-w-xs">
                    <ChatSideBar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
                </div>
                <div className="flex-[3] max-h-screen p-4 overflow-scroll hidden lg:block">
                    <PdfViewer pdf_url={currentChat?.pdfUrl || ""} />
                </div>
                <div className="flex-[3] border-l-4 border-l-slate-200">
                    <ChatComponent chatId={parseInt(chatId)} />
                </div>
            </div>
        </div>
    )
}

export default ChatPage;