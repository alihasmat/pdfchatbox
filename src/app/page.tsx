import { Button } from "@/components/ui/button"
import { UserButton, auth, currentUser } from "@clerk/nextjs";
import FileUpload from "@/components/FileUpload";
import {LogIn} from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const {userId} = await auth();
  const isAuth = !!userId;
  const user = await currentUser();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-slate-300 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
            <a
              className="text-xl font-semibold bg-gradient-to-r from-fuchsia-500 via-red-600 to-orange-400 text-transparent bg-clip-text"
              href="/"
              rel="noreferrer"
            >
              PDFChatBox
            </a>
            
            <div className="flex items-center gap-4">
                Hey, {user?.firstName}
                <UserButton afterSignOutUrl="/"/>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
          <div className="flex flex-col gap-2 items-center">
        
          <h1 className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">Chat with any PDF</h1>
          <p className="text-lg lg:text-lg !leading-tight mx-auto max-w-xl text-center">
          Unlock smarter PDF interactions with PDFChatBox - join millions of students, teachers and professionals.
          </p>
          <div className="mt-2">
            {isAuth && <Link href="chat"><Button>Go to chats</Button></Link>}
          </div>
          <div className="w-full mt-2">
            {
              isAuth ? (
                <FileUpload />
              ): (
            
                <Link href="sign-in" className="flex justify-center">
                  <Button> Login to get started
                    <LogIn className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              
                
              )
            }
          </div>

          </div>


        </div>

        

        <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs text-slate-400">
          <p>
            Powered by{" "}
            <a
              href="/"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              PDFChatBox
            </a>
          </p>
        </footer>
      
      </div> 
    </main>
  );
}
