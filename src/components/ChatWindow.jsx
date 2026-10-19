import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, User, ArrowLeft } from "lucide-react";
import MaxLogo from "./MaxLogo";

export default function ChatWindow({
  chat,
  messages,
  onSendMessage,
  onBack,
  isSending,
}) {
  const [text, setText] = useState("");

  if (!chat) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#F4F4F5]">
        <div className="text-center flex flex-col items-center">
          <MaxLogo className="w-24 h-24 mb-4 opacity-80 drop-shadow-sm" />
          <p className="text-gray-500 text-lg">
            Выберите чат, чтобы начать общение
          </p>
        </div>
      </div>
    );
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;
    onSendMessage(text.trim());
    setText("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F4F5]">
      {/* Шапка чата */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 shadow-sm z-10">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-max-primary to-max-secondary flex items-center justify-center">
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">
            {chat.name || chat.phone}
          </h2>
          <p className="text-xs text-gray-500">+{chat.phone}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.type === "outgoing";
          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                  isMe
                    ? "bg-max-primary text-white rounded-tr-sm"
                    : "bg-white text-gray-800 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            Напишите первое сообщение...
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 h-12 bg-gray-50 border-gray-200 focus-visible:ring-max-primary rounded-xl"
          />
          <Button
            type="submit"
            disabled={isSending || !text.trim()}
            className="bg-max-primary hover:bg-max-secondary text-white rounded-full w-12 h-12 shrink-0 p-0 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
