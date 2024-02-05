import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// api/delete-chat
// api/delete-chat
export async function DELETE(req: Request, res: Response) {
    const { userId } = auth();
  
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  
    try {
      const body = await req.json();
      const { chatId } = body;
  
      // Delete messages associated with the chat
      await db.delete(messages).where(eq(messages.chatId, chatId));
  
      // Delete the chat itself
      await db.delete(chats).where(eq(chats.id, chatId));
  
      return NextResponse.json({ message: 'data deleted successfully!' });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "internal server error" },
        { status: 500 }
      );
    }
  }
  