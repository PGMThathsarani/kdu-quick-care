import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUserStore } from "../../store/UserStore";
import { db } from "../../config/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';

export default function Chat({ chatId: propChatId, chatName } = {}) {
  const location = useLocation();
  const chatId = propChatId || location.state?.chatId;

  const [chatMeta, setChatMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const user = useUserStore((s) => s.user);
  const role = useUserStore((s) => s.role);

  // Load chat metadata
  useEffect(() => {
    if (!chatId) return;
    const chatDocRef = doc(db, "chats", chatId);
    let mounted = true;
    getDoc(chatDocRef)
      .then((snap) => {
        if (mounted && snap.exists())
          setChatMeta({ id: snap.id, ...snap.data() });
      })
      .catch((err) => console.error("Failed to load chat meta", err));
    return () => {
      mounted = false;
    };
  }, [chatId]);

  // Subscribe to messages subcollection
  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(docs);
      },
      (err) => {
        console.error("Messages snapshot error", err);
      }
    );
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!chatId) {
      console.warn("No chatId provided in location.state; cannot send message");
      return;
    }
    const text = input.trim();
    if (!text) return;

    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const newMessage = {
        text,
        sender:
          role ||
          (user?.uid === chatMeta?.studentId ? "student" : "doctor") ||
          "doctor",
        timestamp: serverTimestamp(),
      };
      await addDoc(messagesRef, newMessage);

      const chatDocRef = doc(db, "chats", chatId);
      await updateDoc(chatDocRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
      });

      setInput("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b px-6 py-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-gray-100">
          <AvatarImage 
            src={chatMeta?.studentAvatar || "https://randomuser.me/api/portraits/women/44.jpg"} 
          />
          <AvatarFallback className="bg-gray-100 text-gray-700">
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-lg text-gray-900">
            {chatMeta?.doctorName || chatName || "Chat"}
          </div>
          {chatMeta?.tag && (
            <div className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 inline-block mt-1">
              {chatMeta.tag}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
        <div className="flex flex-col space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isStudent = msg.sender === "student";
              const isDoctor = msg.sender === "doctor";
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                      isStudent
                        ? "bg-black text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Input
            className="flex-1 border-gray-300 rounded-full px-5 py-2.5 focus-visible:ring-black focus-visible:ring-2 focus-visible:border-transparent"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            autoFocus
          />
          <Button 
            onClick={sendMessage}
            disabled={!input.trim()}
            size="icon"
            className="h-11 w-11 rounded-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}