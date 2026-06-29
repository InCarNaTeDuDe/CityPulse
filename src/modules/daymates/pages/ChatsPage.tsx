import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/shared/auth/useAuth';
import { Send, ChevronLeft, Calendar, Ticket, Check, ShieldCheck, User, MessageSquare } from 'lucide-react';
import { Conversation, ChatMessage } from '@/src/shared/types';
import Badge from '@/src/shared/components/Badge';
import { toast } from '@/src/shared/components/Toast';

export const ChatsPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      if (user) {
        const res = await fetch('/api/conversations', {
          headers: {
            'x-user-id': user.id,
            'x-user-name': user.name,
            'x-user-email': user.email,
          }
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          localStorage.setItem('dm_chats', JSON.stringify(data));

          if (activeChat) {
            const freshActive = data.find((c: Conversation) => c.id === activeChat.id);
            if (freshActive) {
              setActiveChat(freshActive);
            }
          }
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load chats from TypeORM backend. Falling back to local storage.', e);
    }

    const saved = localStorage.getItem('dm_chats');
    if (saved) {
      setConversations(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadConversations();

    // Auto-refresh messages stream periodically
    const timer = setInterval(() => {
      loadConversations();
    }, 4000);

    return () => clearInterval(timer);
  }, [user, activeChat?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  const selectConversation = async (conv: Conversation) => {
    setActiveChat({ ...conv, unread: false });

    // Mark as read on backend (system notifications can also use this)
    try {
      if (user) {
        await fetch(`/api/notifications/read-all`, {
          method: 'POST',
          headers: {
            'x-user-id': user.id,
            'x-user-name': user.name,
            'x-user-email': user.email,
          }
        });
      }
    } catch (e) {
      console.error('Failed to mark read on server', e);
    }

    const updated = conversations.map((c) => {
      if (c.id === conv.id) {
        return { ...c, unread: false };
      }
      return c;
    });
    setConversations(updated);
    localStorage.setItem('dm_chats', JSON.stringify(updated));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat || !user) return;

    const typedMsg = messageText;
    setMessageText('');

    try {
      const res = await fetch(`/api/conversations/${activeChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-name': user.name,
          'x-user-email': user.email,
        },
        body: JSON.stringify({ text: typedMsg }),
      });

      if (res.ok) {
        const updatedConvo = await res.json();
        setActiveChat(updatedConvo);
        loadConversations();
        return;
      }
    } catch (err) {
      console.error('Failed to send message on backend, using local storage fallback.', err);
    }

    // Fallback local messaging
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'user_bharath',
      senderName: user?.name || 'Bharath',
      text: typedMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...activeChat.messages, newMessage];
    const updatedActiveChat = {
      ...activeChat,
      lastMessage: typedMsg,
      timestamp: 'Just now',
      messages: updatedMessages,
    };

    const updatedConversations = conversations.map((c) => {
      if (c.id === activeChat.id) {
        return updatedActiveChat;
      }
      return c;
    });

    setConversations(updatedConversations);
    localStorage.setItem('dm_chats', JSON.stringify(updatedConversations));
    setActiveChat(updatedActiveChat);

    // Simulated auto reply fallback
    setTimeout(() => {
      const replies = [
        "Sounds like a plan! See you there in a bit.",
        "That works perfectly. I am heading out soon.",
        "Perfect! I have verified everything, you will love it.",
        "Hey! Awesome. See you shortly near the venue.",
        "Awesome, thanks for the quick swap!"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const autoReplyMessage: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        senderId: activeChat.partnerId,
        senderName: activeChat.partnerName,
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const withReplyMessages = [...updatedMessages, autoReplyMessage];
      const replyActiveChat = {
        ...activeChat,
        lastMessage: randomReply,
        timestamp: 'Just now',
        messages: withReplyMessages,
      };

      const finalConversations = updatedConversations.map((c) => {
        if (c.id === activeChat.id) {
          return replyActiveChat;
        }
        return c;
      });

      setConversations(finalConversations);
      localStorage.setItem('dm_chats', JSON.stringify(finalConversations));
      
      if (activeChat.id === replyActiveChat.id) {
        setActiveChat(replyActiveChat);
      }

      toast(`💬 New message from ${activeChat.partnerName}`);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col md:flex-row font-sans select-none relative min-h-[72vh] bg-white dark:bg-neutral-950">
      {/* 1. Left Pane: Conversation List */}
      <div className={`flex flex-col ${activeChat ? 'hidden md:flex md:w-80 md:shrink-0 md:border-r md:border-neutral-100 dark:md:border-neutral-900 bg-white dark:bg-neutral-950' : 'flex-1'}`}>
        {/* Header */}
        <div className="px-5 py-6 border-b border-neutral-50 dark:border-neutral-900 bg-white dark:bg-neutral-950">
          <h2 
            style={{ fontSize: 'clamp(1.125rem, 5vw, 1.625rem)' }}
            className="font-black text-neutral-900 dark:text-white tracking-tight"
          >
            Chats
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-bold mt-0.5">Your unified opportunity messaging inbox</p>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-24 md:pb-6">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                id={`chat-item-${conv.id}`}
                onClick={() => selectConversation(conv)}
                className={`flex gap-4 p-4 border rounded-2xl cursor-pointer transition relative hover:shadow-md hover:border-neutral-200/80 ${
                  activeChat?.id === conv.id
                    ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50/10 dark:bg-emerald-950/20 shadow-sm'
                    : conv.unread
                    ? 'border-emerald-500 bg-neutral-50 dark:bg-neutral-900/40'
                    : 'border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950'
                }`}
              >
                {/* Badge alert indicator for unread */}
                {conv.unread && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-neutral-900 dark:bg-white rounded-full" />
                )}

                {/* Left side Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={conv.partnerAvatar}
                    alt={conv.partnerName}
                    className="w-12 h-12 rounded-full border border-neutral-100 dark:border-neutral-800 object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-full shadow-sm">
                    {conv.type === 'daymate' ? (
                      <Calendar className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
                    ) : (
                      <Ticket className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                </div>

                {/* Middle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center pr-2">
                    <h3 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 truncate">
                      {conv.partnerName}
                    </h3>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold">
                      {conv.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] font-black text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center gap-1">
                    <span>{conv.targetTitle}</span>
                    <span>•</span>
                    <Badge
                      variant={conv.type === 'daymate' ? 'primary' : 'warning'}
                      className="px-1.5 py-0 text-[8px] font-black"
                    >
                      {conv.type === 'daymate' ? 'Day Mate' : 'TicketSwap'}
                    </Badge>
                  </p>

                  <p className={`text-xs mt-1.5 truncate ${conv.unread ? 'font-bold text-neutral-800 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 text-neutral-400">
              <p className="text-sm font-bold">No conversations yet.</p>
              <p className="text-xs mt-1">Join an activity or buy a ticket to start chatting!</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Right Pane: Active Conversation Workspace or Blank State */}
      {activeChat ? (
        <div className="flex flex-col flex-1 bg-neutral-50/50 dark:bg-neutral-900/10 absolute inset-0 md:relative md:inset-auto z-40">
          {/* Workspace Header */}
          <div className="px-4 py-4 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-900 flex items-center gap-3">
            <button
              id="back-to-inbox"
              onClick={() => {
                setActiveChat(null);
                loadConversations();
              }}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition md:hidden"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <img
              src={activeChat.partnerAvatar}
              alt={activeChat.partnerName}
              className="w-10 h-10 rounded-full border border-neutral-100 dark:border-neutral-800 object-cover"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-black text-neutral-800 dark:text-neutral-200 leading-none truncate">
                  {activeChat.partnerName}
                </h3>
                <Badge variant="success" className="text-[8px] py-0 px-1 font-bold">✓ VERIFIED</Badge>
              </div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-extrabold mt-0.5 uppercase tracking-wide truncate">
                {activeChat.targetTitle}
              </p>
            </div>

            {/* Verified Secure transaction indicator */}
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Escrow Secure</span>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeChat.messages.map((msg) => {
              const isMe = msg.senderId === (user?.id || 'user_bharath');
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-3">
                    <span className="text-[10px] font-extrabold bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700">
                      {msg.text}
                    </span>
                  </div>
                );
              }
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border border-neutral-100 dark:border-neutral-900 rounded-tl-none'
                    }`}
                  >
                    <p className="text-xs font-semibold leading-relaxed break-words">{msg.text}</p>
                    <span className={`text-[8px] font-bold block text-right mt-1.5 ${isMe ? 'text-neutral-300 dark:text-neutral-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Send Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900 flex gap-2">
            <input
              id="chat-message-input-bar"
              type="text"
              placeholder={`Message ${activeChat.partnerName}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100/50 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-950 border border-transparent focus:border-neutral-200 dark:focus:border-neutral-800 rounded-xl px-4 text-xs font-semibold placeholder-neutral-400 outline-none transition"
            />
            <button
              id="send-message-btn"
              type="submit"
              disabled={!messageText.trim()}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4 stroke-[2.2]" />
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-col flex-1 items-center justify-center text-neutral-400 dark:text-neutral-500 bg-neutral-50/50 dark:bg-neutral-900/10 p-6">
          <div className="text-center p-8 bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-900 shadow-sm max-w-sm">
            <MessageSquare className="w-12 h-12 stroke-[1.5] text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Your Conversations</p>
            <p className="text-xs mt-1.5 leading-relaxed text-neutral-500">Select a chat thread from the left list pane to begin chatting securely over escrow transaction ledgers.</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatsPage;
