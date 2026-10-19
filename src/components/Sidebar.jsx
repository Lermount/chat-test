import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Search, User, LogOut } from "lucide-react";

export default function Sidebar({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onLogout,
  idInstance,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const nameMatch = (chat.name || "").toLowerCase().includes(query);
    const phoneMatch = (chat.phone || "").includes(query);

    return nameMatch || phoneMatch;
  });

  return (
    <div className="w-full md:w-80 flex flex-col bg-white border-r border-gray-200 h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Чаты</h2>
        <Button
          size="icon"
          className="rounded-full bg-max-primary hover:bg-max-secondary"
          onClick={onNewChat}
          title="Создать новый чат"
        >
          <Plus className="h-5 w-5 text-white" />
        </Button>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-100 focus-visible:ring-max-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm mt-10">
            {searchQuery
              ? "Ничего не найдено"
              : "У вас пока нет чатов. Нажмите '+', чтобы начать."}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.phone}
              onClick={() => onSelectChat(chat)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                activeChat?.phone === chat.phone ? "bg-blue-50" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-max-primary to-max-secondary flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3
                    className={`truncate ${chat.unreadCount > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}
                  >
                    {chat.name || chat.phone}
                  </h3>
                  {chat.unreadCount > 0 && (
                    <span className="bg-max-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {chat.lastMessage || "Нет сообщений"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-white flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">
            Мой профиль
          </span>
          <span className="text-xs text-gray-500 font-mono mt-0.5">
            ID: {idInstance}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          onClick={onLogout}
          title="Выйти из аккаунта"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
