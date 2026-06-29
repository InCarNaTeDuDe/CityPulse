import React, { useState, useTransition, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Plus,
  Bell,
  User as UserIcon,
  Calendar,
  Ticket,
  Award,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/src/shared/auth/useAuth";
import { useTheme } from "@/src/shared/theme/ThemeContext";
import Drawer from "@/src/shared/components/Drawer";
import Button from "@/src/shared/components/Button";
import Input from "@/src/shared/components/Input";
import TextArea from "@/src/shared/components/TextArea";
import { toast, ToastContainer } from "@/src/shared/components/Toast";
import { Activity, Ticket as TicketType } from "@/src/shared/types";

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createType, setCreateType] = useState<
    "menu" | "activity" | "ticket" | "event" | "ask"
  >("menu");
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Generate accessible unique IDs using React 19 useId hook
  const actTitleId = React.useId();
  const actDescId = React.useId();
  const actLocId = React.useId();
  const tktTitleId = React.useId();
  const tktOrigPriceId = React.useId();
  const tktSellPriceId = React.useId();
  const tktLocId = React.useId();

  const prevUnreadCount = useRef(0);
  const prevUnreadNotifCount = useRef(0);
  const [animateInbox, setAnimateInbox] = useState(false);
  const [animateAlerts, setAnimateAlerts] = useState(false);

  const getGreetingMeta = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return {
        greeting: "Good Morning",
        emoji: "😊",
      };
    }

    if (hour < 18) {
      return {
        greeting: "Good Afternoon",
        emoji: "😄",
      };
    }

    if (hour < 21) {
      return {
        greeting: "Good Evening",
        emoji: "🤗",
      };
    }

    return {
      greeting: "Good Night",
      emoji: "😴",
    };
  };

  // Web Audio API beep sound
  const playNotificationSound = () => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      // Pleasant alert: high pitched 2-step beep
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(880.0, audioCtx.currentTime + 0.1); // A5

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.25,
      );

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn(
        "Web Audio API not supported or blocked by user gesture:",
        e,
      );
    }
  };

  // Poll unread messages
  React.useEffect(() => {
    const checkUnreads = async () => {
      if (!user) return;
      try {
        const headers = {
          "x-user-id": user.id,
          "x-user-name": user.name,
          "x-user-email": user.email,
        };

        let currentChatsUnread = 0;
        let currentNotifsUnread = 0;

        // Fetch conversations
        const chatsRes = await fetch("/api/conversations", { headers });
        if (chatsRes.ok) {
          const chats = await chatsRes.json();
          currentChatsUnread = chats.filter((c: any) => c.unread).length;
          setUnreadCount(currentChatsUnread);
        }

        // Fetch notifications
        const notifsRes = await fetch("/api/notifications", { headers });
        if (notifsRes.ok) {
          const notifs = await notifsRes.json();
          currentNotifsUnread = notifs.filter((n: any) => !n.read).length;
          setUnreadNotifCount(currentNotifsUnread);
        }

        // Check if there are new unread chats or notifications
        let gotNew = false;
        if (currentChatsUnread > prevUnreadCount.current) {
          setAnimateInbox(true);
          setTimeout(() => setAnimateInbox(false), 1500);
          gotNew = true;
        }
        if (currentNotifsUnread > prevUnreadNotifCount.current) {
          setAnimateAlerts(true);
          setTimeout(() => setAnimateAlerts(false), 1500);
          gotNew = true;
        }

        if (gotNew) {
          playNotificationSound();
        }

        prevUnreadCount.current = currentChatsUnread;
        prevUnreadNotifCount.current = currentNotifsUnread;
      } catch (e) {
        console.error(e);
      }
    };
    checkUnreads();
    const interval = setInterval(checkUnreads, 4000);
    window.addEventListener("feed-reload", checkUnreads);
    return () => {
      clearInterval(interval);
      window.removeEventListener("feed-reload", checkUnreads);
    };
  }, [user]);

  // Forms state
  const [actTitle, setActTitle] = useState("");
  const [actCategory, setActCategory] = useState<
    "Cricket" | "Coffee" | "Movie" | "Lunch" | "Badminton" | "Pizza" | "Other"
  >("Coffee");
  const [actDesc, setActDesc] = useState("");
  const [actLocation, setActLocation] = useState("");
  const [actPeopleNeeded, setActPeopleNeeded] = useState(3);

  const [tktTitle, setTktTitle] = useState("");
  const [tktCategory, setTktCategory] = useState<
    "Movie" | "F1" | "Concert" | "Sports" | "Drama" | "Other"
  >("Movie");
  const [tktOriginal, setTktOriginal] = useState("");
  const [tktSelling, setTktSelling] = useState("");
  const [tktLocation, setTktLocation] = useState("");

  const currentTab = location.pathname;

  const [isPending, startTransition] = useTransition();

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await handleCreateActivity();
    });
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await handleCreateTicket();
    });
  };

  const handleCreateActivity = async () => {
    if (!actTitle || !actDesc || !actLocation) {
      toast("Please fill out all fields", "warning");
      return;
    }

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-name": user?.name || "",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify({
          title: actTitle,
          category: actCategory,
          description: actDesc,
          peopleNeeded: actPeopleNeeded,
          time: "Today, 6:00 PM",
          location: actLocation,
        }),
      });

      if (res.ok) {
        toast("🎉 Activity posted nearby for today!");

        // Reset Form
        setActTitle("");
        setActDesc("");
        setActLocation("");
        setActPeopleNeeded(3);
        setIsDrawerOpen(false);

        // Trigger custom event so feeds reload immediately
        window.dispatchEvent(new CustomEvent("feed-reload"));
        navigate("/app");
        return;
      } else {
        const err = await res.json();
        toast(err.error || "Failed to list activity", "error");
        return;
      }
    } catch (e) {
      console.error("Failed to post activity to backend", e);
    }

    // Fallback logic removed per user requirement (no local storage cache)
    toast(
      "Failed to post activity to backend. Please check your connection.",
      "error",
    );
    return;
  };

  const handleCreateTicket = async () => {
    if (!tktTitle || !tktOriginal || !tktSelling || !tktLocation) {
      toast("Please fill out all fields", "warning");
      return;
    }

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-name": user?.name || "",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify({
          title: tktTitle,
          category: tktCategory,
          originalPrice: tktOriginal,
          sellingPrice: tktSelling,
          quantity: 1,
          location: tktLocation,
        }),
      });

      if (res.ok) {
        toast("🎟 Ticket listed on TicketSwap!");

        // Reset Form
        setTktTitle("");
        setTktOriginal("");
        setTktSelling("");
        setTktLocation("");
        setIsDrawerOpen(false);

        // Trigger custom event so feeds reload immediately
        window.dispatchEvent(new CustomEvent("feed-reload"));
        navigate("/app");
        return;
      } else {
        const err = await res.json();
        toast(err.error || "Failed to list ticket", "error");
        return;
      }
    } catch (e) {
      console.error("Failed to list ticket on backend", e);
    }

    // Fallback logic removed per user requirement (no local storage cache)
    toast(
      "Failed to list ticket on backend. Please check your connection.",
      "error",
    );
    return;
  };

  const openDrawer = () => {
    setCreateType("menu");
    setIsDrawerOpen(true);
  };

  const greeting = getGreetingMeta();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col md:flex-row items-stretch transition-[background-color] duration-150">
      {/* 1. Desktop Left Sidebar Navigation (visible only on md and up) */}
      <aside className="hidden md:flex md:w-64 lg:w-80 bg-white dark:bg-neutral-950 border-r border-neutral-100 dark:border-neutral-900 flex-col justify-between p-6 shrink-0 transition-[background-color,border-color] duration-150 text-neutral-900 dark:text-neutral-100">
        <div className="flex flex-col gap-8">
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/20">
                ⚡
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none text-neutral-900 dark:text-white">
                  DayMates
                </h1>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold tracking-wider mt-1 uppercase">
                  Local Area
                </p>
              </div>
            </div>
          </div>

          {/* User quick profile summary in sidebar - No wallet balance */}
          {user && (
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4 border border-neutral-100/50 dark:border-neutral-800/50 flex items-center gap-3">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&bold=true`
                }
                alt={user.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-emerald-500 font-bold">
                    Verified ✅
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => navigate("/")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black text-left cursor-pointer ${
                currentTab === "/"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 shadow-md shadow-emerald-600/20"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              }`}
            >
              <Home className="w-4 h-4 stroke-[2.2]" />
              <span>Explore Mates & Tickets</span>
            </button>

            <button
              onClick={() => navigate("/chats")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black text-left cursor-pointer relative ${
                currentTab === "/chats"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 shadow-md shadow-emerald-600/20"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              } ${animateInbox ? "animate-blink-inbox" : ""}`}
            >
              <MessageSquare
                className={`w-4 h-4 stroke-[2.2] ${unreadCount > 0 ? "text-rose-500 animate-pulse" : ""}`}
              />
              <span className="flex-1">Chats</span>
              {unreadCount > 0 && (
                <span className="absolute right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/notifications")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black text-left cursor-pointer relative ${
                currentTab === "/notifications"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 shadow-md shadow-emerald-600/20"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              }`}
            >
              <div
                className={
                  unreadNotifCount > 0 || animateAlerts
                    ? "animate-bell-shake"
                    : ""
                }
              >
                <Bell className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="flex-1 font-black">Alerts</span>
              {unreadNotifCount > 0 && (
                <span
                  className={`absolute right-4 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-neutral-950 text-[10px] font-bold px-2 py-0.5 rounded-full ${unreadNotifCount > 0 ? "animate-badge-scale" : ""}`}
                >
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/profile")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black text-left cursor-pointer ${
                currentTab === "/profile"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 shadow-md shadow-emerald-600/20"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
              }`}
            >
              <UserIcon className="w-4 h-4 stroke-[2.2]" />
              <span>My Profile</span>
            </button>
          </nav>

          {/* Desktop Big Create CTA */}
          <button
            onClick={openDrawer}
            className="w-full py-3.5 bg-emerald-600 hover:bg-green-600 dark:bg-emerald-500 dark:hover:bg-green-400 text-white dark:text-neutral-950 font-mono font-extrabold tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs uppercase"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Post Opportunity
          </button>
        </div>

        {/* Sidebar Footer - Clean branding only */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-900">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            DayMates © 2026
          </span>
          <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
            v1.1
          </span>
        </div>
      </aside>

      {/* 2. Main Area Container (fully responsive) */}
      <main className="flex-1 flex flex-col justify-start items-stretch overflow-y-auto max-w-full bg-white dark:bg-neutral-950">
        <div className="w-full flex-1 flex flex-col relative overflow-hidden pb-24 md:pb-6 transition-[background-color] duration-150 text-neutral-900 dark:text-neutral-100">
          {/* Global Top Header Bar - Throughout Web & Mobile */}
          <header className="flex justify-between items-center px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-900 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md sticky top-0 z-20 transition-[background-color,border-color] duration-150">
            {/* <div className="flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">
                ⚡
              </span>
              <span className="font-black text-sm tracking-tight text-neutral-800 dark:text-neutral-100">
                DayMates
              </span>
            </div> */}

            <div className="ml-auto flex items-center gap-3">
              <span className="flex items-center text-xs sm:text-sm font-black text-neutral-700 dark:text-neutral-300 truncate max-w-[220px] sm:max-w-none">
                <span
                  className="animate-greeting mr-1.5 text-xl select-none"
                  role="img"
                  aria-label="Greeting"
                >
                  {greeting.emoji}
                </span>

                <span>
                  {greeting.greeting},
                  <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {user?.name?.split(" ")?.at(0) || ""}
                  </span>
                </span>
              </span>

              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition duration-150 cursor-pointer"
                title="Toggle Theme"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => navigate("/chats")}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                  currentTab === "/chats"
                    ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-neutral-950 font-black shadow-sm"
                    : "bg-neutral-50 border-neutral-200/50 dark:bg-neutral-900/40 dark:border-neutral-800/85 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                } ${animateInbox ? "animate-blink-inbox" : ""}`}
              >
                <MessageSquare
                  className={`w-3.5 h-3.5 ${unreadCount > 0 ? "text-rose-500 animate-pulse" : ""}`}
                />
                <span className="font-bold hidden sm:inline">Inbox</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* Core Screen Context */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>

          {/* Floating/Bottom Action Bar - Strictly Mobile Only */}
          <div className="md:hidden fixed bottom-0 left-4 right-4 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-lg border border-neutral-200/50 dark:border-neutral-900/80 px-4 py-3 flex justify-around items-center z-30 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 transition-all duration-200">
            <button
              id="tab-home"
              onClick={() => navigate("/")}
              className={`flex flex-col items-center gap-1 transition ${
                currentTab === "/"
                  ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              }`}
            >
              <Home className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] font-bold">Home</span>
            </button>

            <button
              id="tab-chats"
              onClick={() => navigate("/chats")}
              className={`flex flex-col items-center gap-1 transition relative ${
                currentTab === "/chats"
                  ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5 stroke-[2.2]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[8px] font-extrabold px-1 rounded-full min-w-4 text-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">Chats</span>
            </button>

            {/* Unified Create Button */}
            <div className="relative -top-5">
              <button
                id="fab-create"
                onClick={openDrawer}
                className="w-14 h-14 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-neutral-950 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 dark:shadow-neutral-950/40 hover:bg-emerald-700 dark:hover:bg-emerald-400 transition active:scale-95 border-4 border-white dark:border-neutral-950 cursor-pointer"
              >
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </button>
            </div>

            <button
              id="tab-notifications"
              onClick={() => navigate("/notifications")}
              className={`flex flex-col items-center gap-1 transition relative ${
                currentTab === "/notifications"
                  ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              }`}
            >
              <div className="relative">
                <div
                  className={
                    unreadNotifCount > 0 || animateAlerts
                      ? "animate-bell-shake"
                      : ""
                  }
                >
                  <Bell className="w-5 h-5 stroke-[2.2]" />
                </div>
                {unreadNotifCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-2 bg-emerald-500 text-white text-[8px] font-extrabold px-1 rounded-full min-w-4 text-center ${unreadNotifCount > 0 ? "animate-badge-scale" : ""}`}
                  >
                    {unreadNotifCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">Alerts</span>
            </button>

            <button
              id="tab-profile"
              onClick={() => navigate("/profile")}
              className={`flex flex-col items-center gap-1 transition ${
                currentTab === "/profile"
                  ? "text-emerald-600 dark:text-emerald-400 scale-105 font-black"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              }`}
            >
              <UserIcon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] font-bold">Profile</span>
            </button>
          </div>
        </div>
      </main>

      {/* Reusable Toast Stack */}
      <ToastContainer />

      {/* Elegant Action Bottom Sheet */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          createType === "menu"
            ? "What would you like to do today?"
            : createType === "activity"
              ? "👥 Find Day Mates"
              : createType === "ticket"
                ? "🎟 Sell Event Ticket"
                : createType === "event"
                  ? "Host Local Event"
                  : "Ask Something Nearby"
        }
      >
        {/* Dynamic Inner Menus */}
        {createType === "menu" && (
          <div className="flex flex-col gap-3">
            <button
              id="action-find-daymates"
              onClick={() => setCreateType("activity")}
              className="flex items-center gap-4 p-4 border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 rounded-2xl text-left transition-all duration-150 cursor-pointer group"
            >
              <div className="p-3 bg-neutral-900 dark:bg-neutral-800 text-white rounded-xl transition-transform group-hover:scale-105">
                <Calendar className="w-5 h-5 transition-colors group-hover:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  👥 Find Day Mates
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Meet people for cricket, lunch, coffee, or movies today.
                </p>
              </div>
            </button>

            <button
              id="action-sell-ticket"
              onClick={() => setCreateType("ticket")}
              className="flex items-center gap-4 p-4 border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 rounded-2xl text-left transition-all duration-150 cursor-pointer group"
            >
              <div className="p-3 bg-amber-500 text-white rounded-xl transition-transform group-hover:scale-105">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  🎟 Sell Ticket
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Sell last-minute extra tickets to people nearby securely.
                </p>
              </div>
            </button>

            <button
              id="action-host-event"
              onClick={() => {
                toast(
                  "🎉 Event Hosting currently premium invite-only! Posted simulator placeholder.",
                );
                setIsDrawerOpen(false);
              }}
              className="flex items-center gap-4 p-4 border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 rounded-2xl text-left transition-all duration-150 cursor-pointer group"
            >
              <div className="p-3 bg-purple-500 text-white rounded-xl transition-transform group-hover:scale-105">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  🎉 Host Event
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Organize pub crawls, turf games, or community mixers.
                </p>
              </div>
            </button>

            <button
              id="action-ask-nearby"
              onClick={() => {
                toast("📢 Community Question Board opening soon today!");
                setIsDrawerOpen(false);
              }}
              className="flex items-center gap-4 p-4 border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 rounded-2xl text-left transition-all duration-150 cursor-pointer group"
            >
              <div className="p-3 bg-blue-500 text-white rounded-xl transition-transform group-hover:scale-105">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  📢 Ask Something Nearby
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Ask questions about crowds, entry-fees, or recommend bars.
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Activity Creation Form */}
        {createType === "activity" && (
          <form onSubmit={handleActivitySubmit} className="flex flex-col gap-4">
            <Input
              id={actTitleId}
              label="What activity are you doing today?"
              placeholder="e.g. Cricket match at Turf, Coffee chat"
              value={actTitle}
              onChange={(e) => setActTitle(e.target.value)}
            />

            <div className="flex flex-col gap-1.5 font-sans">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    "Cricket",
                    "Coffee",
                    "Movie",
                    "Lunch",
                    "Badminton",
                    "Pizza",
                    "Other",
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActCategory(cat)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      actCategory === cat
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950 font-black"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <TextArea
              id={actDescId}
              label="Describe details (time, age-group, turf status)"
              placeholder="e.g. Turf booked for 6pm. Looking for 3 bowlers."
              value={actDesc}
              onChange={(e) => setActDesc(e.target.value)}
            />

            <Input
              id={actLocId}
              label="Where is the meetup happening?"
              placeholder="e.g. Central Sports Ground, Starbucks Coffee"
              value={actLocation}
              onChange={(e) => setActLocation(e.target.value)}
            />

            <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                How many people needed?
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActPeopleNeeded(Math.max(1, actPeopleNeeded - 1))
                  }
                  className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold text-sm text-neutral-600 dark:text-neutral-300 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition cursor-pointer"
                >
                  -
                </button>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                  {actPeopleNeeded}
                </span>
                <button
                  type="button"
                  onClick={() => setActPeopleNeeded(actPeopleNeeded + 1)}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold text-sm text-neutral-600 dark:text-neutral-300 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 dark:border-neutral-800 dark:hover:bg-neutral-900"
                onClick={() => setCreateType("menu")}
              >
                Back
              </Button>
              <Button
                type="submit"
                isLoading={isPending}
                className="flex-1 bg-neutral-900 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-white font-bold"
              >
                Create Opportunity
              </Button>
            </div>
          </form>
        )}

        {/* Ticket Swap Creation Form */}
        {createType === "ticket" && (
          <form onSubmit={handleTicketSubmit} className="flex flex-col gap-4">
            <Input
              id={tktTitleId}
              label="What event/movie is this ticket for?"
              placeholder="e.g. Superman Legacy 3D, F1 red zone ticket"
              value={tktTitle}
              onChange={(e) => setTktTitle(e.target.value)}
            />

            <div className="flex flex-col gap-1.5 font-sans">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    "Movie",
                    "F1",
                    "Concert",
                    "Sports",
                    "Drama",
                    "Other",
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTktCategory(cat)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      tktCategory === cat
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950 font-black"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                id={tktOrigPriceId}
                type="number"
                label="Original Price (₹)"
                placeholder="Original cost"
                value={tktOriginal}
                onChange={(e) => setTktOriginal(e.target.value)}
              />
              <Input
                id={tktSellPriceId}
                type="number"
                label="Selling Price (₹)"
                placeholder="Discounted price"
                value={tktSelling}
                onChange={(e) => setTktSelling(e.target.value)}
              />
            </div>

            <Input
              id={tktLocId}
              label="Theatre / Venue Name"
              placeholder="e.g. PVR Forum Mall, Jayanagar Stadium"
              value={tktLocation}
              onChange={(e) => setTktLocation(e.target.value)}
            />

            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 dark:border-neutral-800 dark:hover:bg-neutral-900"
                onClick={() => setCreateType("menu")}
              >
                Back
              </Button>
              <Button
                type="submit"
                isLoading={isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 text-white font-bold"
              >
                List Ticket
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
};
export default AppLayout;
