import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import Chat from '@/models/chat';
import { User } from '@/app/models/User';
import connectDB from '@/lib/mongodb';

// Get all chats for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all chats where the user is a participant
    const chats = await Chat.find({
      participants: session.user.id
    })
    .populate('participants', 'name email image')
    .populate('lastMessage.sender', 'name email image')
    .sort({ 'lastMessage.timestamp': -1 });

    // Calculate total unread messages for all chats
    let totalUnread = 0;
    
    // Transform the response to include unread count for each chat
    const chatsWithUnread = chats.map(chat => {
      const chatObj = chat.toObject();
      
      // Get unread count for current user
      const unreadCount = chat.unreadCount?.get(session.user.id) || 0;
      totalUnread += unreadCount;
      
      return {
        ...chatObj,
        unreadCount
      };
    });

    return NextResponse.json({
      chats: chatsWithUnread,
      totalUnread
    });
  } catch (error) {
    console.error("[CHAT_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Send a message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, message } = await req.json();

    if (!recipientId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [session.user.id, recipientId] }
    });

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        participants: [session.user.id, recipientId],
        messages: [],
        lastMessage: null
      });
    }

    // Add new message
    const newMessage = {
      sender: session.user.id,
      content: message,
      timestamp: new Date(),
      readBy: [session.user.id]
    };

    chat.messages.push(newMessage);
    chat.lastMessage = {
      content: message,
      timestamp: new Date(),
      sender: session.user.id
    };

    // Update unread count for the recipient
    const recipientUnreadCount = chat.unreadCount?.get(recipientId) || 0;
    chat.unreadCount = chat.unreadCount || new Map();
    chat.unreadCount.set(recipientId, recipientUnreadCount + 1);

    await chat.save();

    // Populate the response with user details
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name email image')
      .populate('lastMessage.sender', 'name email image');

    return NextResponse.json(populatedChat);
  } catch (error) {
    console.error("[CHAT_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Add this PATCH method to mark messages as read
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    await connectDB();

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Mark messages as read
    for (const message of chat.messages) {
      if (!message.readBy.includes(session.user.id)) {
        message.readBy.push(session.user.id);
      }
    }

    // Reset unread count for the current user
    chat.unreadCount = chat.unreadCount || new Map();
    chat.unreadCount.set(session.user.id, 0);
    
    await chat.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHAT_MARK_READ]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 