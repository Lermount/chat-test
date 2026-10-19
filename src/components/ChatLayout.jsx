import { useState, useEffect, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  sendMessage,
  checkAccount,
  receiveNotification,
  deleteNotification,
} from "../api/greenApi";

export default function ChatLayout({ credentials }) {
  const [chats, setChats] = useLocalStorage("max_chats", []);
  const [activeChat, setActiveChat] = useState(null);
  const [allMessages, setAllMessages] = useLocalStorage("max_messages", {});
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const messages = activeChat ? allMessages[activeChat.phone] || [] : [];

  const handleLogout = () => {
    localStorage.removeItem("green_api_id");
    localStorage.removeItem("green_api_token");
    localStorage.removeItem("max_chats");
    localStorage.removeItem("max_messages");
    window.location.reload();
  };

  const handleCreateChat = (e) => {
    e.preventDefault();

    let phone = newPhone.replace(/\D/g, "");
    if (phone.length === 10) phone = "7" + phone;

    const isValidFormat =
      (phone.length === 11 && phone.startsWith("7")) ||
      (phone.length === 12 && phone.startsWith("375"));

    if (!isValidFormat) {
      alert(
        "Неверный формат. Введите номер РФ (11 цифр, начиная с 7) или РБ (12 цифр, начиная с 375).",
      );
      return;
    }

    const existingChat = chats.find((c) => c.phone === phone);
    if (existingChat) {
      setActiveChat(existingChat);
      setIsCreatingChat(false);
      setNewPhone("");
      return;
    }

    const newChat = {
      phone,
      name: `+${phone}`,
      lastMessage: "",
      unreadCount: 0,
    };
    setChats([newChat, ...chats]);
    setActiveChat(newChat);
    setIsCreatingChat(false);
    setNewPhone("");
  };

  const handleSendMessage = async (text) => {
    if (!activeChat || isSending) return;
    setIsSending(true);

    const newMsg = { text, type: "outgoing", timestamp: Date.now() };
    setAllMessages((prev) => ({
      ...prev,
      [activeChat.phone]: [...(prev[activeChat.phone] || []), newMsg],
    }));
    setChats((prev) =>
      prev.map((c) =>
        c.phone === activeChat.phone ? { ...c, lastMessage: text } : c,
      ),
    );

    try {
      // 1. Очищаем номер от лишних символов
      let rawPhone = (activeChat.phone || "").replace(/\D/g, "");
      let finalChatId = rawPhone;

      // 2. Если это похоже на номер телефона (7-15 цифр), пытаемся узнать chatId
      if (rawPhone.length >= 7 && rawPhone.length <= 15) {
        try {
          const accountInfo = await checkAccount(credentials, rawPhone);
          if (accountInfo.exist && accountInfo.chatId) {
            finalChatId = accountInfo.chatId;
          }
        } catch (e) {
          console.warn(
            "Не удалось проверить аккаунт, пробуем отправить как есть:",
            e,
          );
          // Если ошибка при проверке, пробуем отправить как номер@c.us
          finalChatId = `${rawPhone}@c.us`;
        }
      }

      // 3. Отправляем
      await sendMessage(credentials, finalChatId, text);
    } catch (error) {
      console.error("Ошибка отправки:", error);
      alert("Не удалось отправить сообщение: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const pollMessages = async () => {
      if (!isMounted) return;

      try {
        const notification = await receiveNotification(credentials);

        if (notification && notification.body) {
          const { typeWebhook, senderData, messageData } = notification.body;

          const isIncoming = typeWebhook === "incomingMessageReceived";
          const isOutgoing = typeWebhook === "outgoingMessageReceived";

          if ((isIncoming || isOutgoing) && messageData) {
            let senderPhone = senderData.senderPhoneNumber?.toString();

            if (!senderPhone || senderPhone === "0") {
              senderPhone = senderData.sender.split("@")[0];
            }

            let text = "";
            if (messageData.typeMessage === "textMessage") {
              text = messageData.textMessageData?.textMessage || "";
            } else if (messageData.typeMessage === "extendedTextMessage") {
              text = messageData.extendedTextMessageData?.text || "";
            }

            if (text && senderPhone) {
              const incomingMsg = {
                text,
                type: isIncoming ? "incoming" : "outgoing",
                timestamp: Date.now(),
              };

              setAllMessages((prev) => ({
                ...prev,
                [senderPhone]: [...(prev[senderPhone] || []), incomingMsg],
              }));

              setChats((prev) => {
                const hasChat = prev.find((c) => c.phone === senderPhone);
                const isChatActive =
                  activeChatRef.current?.phone === senderPhone;

                if (hasChat) {
                  return prev.map((c) => {
                    if (c.phone === senderPhone) {
                      return {
                        ...c,
                        lastMessage: text,
                        unreadCount:
                          !isChatActive && isIncoming
                            ? (c.unreadCount || 0) + 1
                            : c.unreadCount,
                      };
                    }
                    return c;
                  });
                } else {
                  return [
                    {
                      phone: senderPhone,
                      name: senderData.senderName || `+${senderPhone}`,
                      lastMessage: text,
                      unreadCount: isIncoming ? 1 : 0,
                    },
                    ...prev,
                  ];
                }
              });
            }
          }

          await deleteNotification(credentials, notification.receiptId);
        }
      } catch (error) {
        console.warn("Poll error:", error);
      }

      if (isMounted) {
        setTimeout(pollMessages, 2000);
      }
    };

    pollMessages();

    return () => {
      isMounted = false;
    };
  }, [credentials, setAllMessages, setChats]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F4F5]">
      <div
        className={`${activeChat ? "hidden md:flex" : "flex"} w-full md:w-80 shrink-0 flex-col`}
      >
        <Sidebar
          chats={chats}
          activeChat={activeChat}
          idInstance={credentials.idInstance}
          onSelectChat={(chat) => {
            setActiveChat(chat);
            setChats((prev) =>
              prev.map((c) =>
                c.phone === chat.phone ? { ...c, unreadCount: 0 } : c,
              ),
            );
          }}
          onNewChat={() => setIsCreatingChat(true)}
          onLogout={handleLogout}
        />
      </div>

      <div className={`${activeChat ? "flex" : "hidden md:flex"} flex-1`}>
        <ChatWindow
          chat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          onBack={() => setActiveChat(null)}
          isSending={isSending}
        />
      </div>

      {isCreatingChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">Новый чат</h3>
            <form onSubmit={handleCreateChat} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Номер телефона
                </label>
                <Input
                  autoFocus
                  type="tel"
                  inputMode="numeric"
                  placeholder="79991234567"
                  value={newPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setNewPhone(val);
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreatingChat(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="bg-max-primary hover:bg-max-secondary text-white"
                >
                  Создать
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
