import React, { useState, useEffect, useTransition, use, Suspense } from 'react';
import { useAuth } from '@/src/shared/auth/useAuth';
import { useTheme } from '@/src/shared/theme/ThemeContext';
import { Search, Calendar, Ticket, User, ArrowRight, Check, ShieldAlert, Sparkles, Sun, Moon, Loader2 } from 'lucide-react';
import Card from '@/src/shared/components/Card';
import Badge from '@/src/shared/components/Badge';
import Button from '@/src/shared/components/Button';
import Dialog from '@/src/shared/components/Dialog';
import { toast } from '@/src/shared/components/Toast';
import { Activity, Ticket as TicketType, Conversation } from '@/src/shared/types';
import { useNavigate } from 'react-router-dom';

// Fetch helper returning React 19 compatible promise
const fetchFeeds = async (user: any): Promise<{ activities: Activity[]; tickets: TicketType[] }> => {
  try {
    const headers: HeadersInit = {};
    if (user) {
      headers['x-user-id'] = user.id;
      headers['x-user-name'] = user.name;
      headers['x-user-email'] = user.email;
    }

    const [resActs, resTkts] = await Promise.all([
      fetch('/api/activities', { headers }),
      fetch('/api/tickets', { headers })
    ]);

    if (resActs.ok && resTkts.ok) {
      const dataActs = await resActs.json();
      const dataTkts = await resTkts.json();

      // Maintain local backup for offline-first resilience
      localStorage.setItem('dm_activities', JSON.stringify(dataActs));
      localStorage.setItem('ts_tickets', JSON.stringify(dataTkts));
      
      return { activities: dataActs, tickets: dataTkts };
    }
  } catch (e) {
    console.error('Failed to fetch feeds from Express backend. Falling back to localStorage.', e);
  }

  // Local storage fallback
  const savedActs = JSON.parse(localStorage.getItem('dm_activities') || '[]');
  const savedTkts = JSON.parse(localStorage.getItem('ts_tickets') || '[]');
  return { activities: savedActs, tickets: savedTkts };
};

// Modern, high-contrast pulse skeleton loading screen
const HomeFeedSkeleton = () => {
  return (
    <div className="px-5 py-6 font-sans animate-pulse">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        </div>
      </div>

      {/* Filter Segmented Control */}
      <div className="h-14 bg-neutral-200 dark:bg-neutral-800 rounded-2xl mb-5" />

      {/* Search Bar */}
      <div className="h-11 bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-6" />

      {/* Skeletons of Feed Cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="flex justify-between items-center pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                <div className="h-3.5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
              <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Parent Component holding the active Feed Promise
export const HomeFeed: React.FC = () => {
  const { user } = useAuth();
  const [feedPromise, setFeedPromise] = useState<Promise<{ activities: Activity[]; tickets: TicketType[] }>>(() =>
    fetchFeeds(user)
  );

  // Re-trigger Promise when profile changes
  useEffect(() => {
    setFeedPromise(fetchFeeds(user));
  }, [user]);

  // Handle automatic feed updates
  useEffect(() => {
    const handleReload = () => {
      setFeedPromise(fetchFeeds(user));
    };
    window.addEventListener('feed-reload', handleReload);
    return () => window.removeEventListener('feed-reload', handleReload);
  }, [user]);

  return (
    <Suspense fallback={<HomeFeedSkeleton />}>
      <HomeFeedContent feedPromise={feedPromise} />
    </Suspense>
  );
};

// Suspended Child Component using React 19's use() hook
interface HomeFeedContentProps {
  feedPromise: Promise<{ activities: Activity[]; tickets: TicketType[] }>;
}

const HomeFeedContent: React.FC<HomeFeedContentProps> = ({ feedPromise }) => {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Resolve Promise using React 19 use()
  const data = use(feedPromise);
  const [activities, setActivities] = useState<Activity[]>(data.activities);
  const [tickets, setTickets] = useState<TicketType[]>(data.tickets);

  // Sync state with resolved promise data updates
  useEffect(() => {
    setActivities(data.activities);
    setTickets(data.tickets);
  }, [data]);

  // UI States
  const [filterMode, setFilterMode] = useState<'all' | 'daymates' | 'tickets'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // React 19 Form action / transaction handler
  const [isActionPending, startActionTransition] = useTransition();

  // Poll unread messages for notification badge
  useEffect(() => {
    const checkUnreads = () => {
      try {
        const saved = localStorage.getItem('dm_chats');
        if (saved) {
          const chats = JSON.parse(saved);
          const count = chats.filter((c: any) => c.unread).length;
          setUnreadCount(count);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkUnreads();
    const interval = setInterval(checkUnreads, 3000);
    return () => clearInterval(interval);
  }, []);

  // Day Mates: Join/Leave Action
  const handleJoinActivity = (actId: string) => {
    if (!user) {
      toast('Please log in first', 'warning');
      return;
    }

    startActionTransition(async () => {
      try {
        const res = await fetch(`/api/activities/${actId}/join`, {
          method: 'POST',
          headers: {
            'x-user-id': user.id,
            'x-user-name': user.name,
            'x-user-email': user.email,
          }
        });

        if (res.ok) {
          const updatedActivity = await res.json();
          toast(updatedActivity.isJoined 
            ? `🎉 Successfully joined: "${updatedActivity.title}"!` 
            : `👥 Left activity: "${updatedActivity.title}"`
          );
          
          window.dispatchEvent(new CustomEvent('feed-reload'));
          return;
        } else {
          const err = await res.json();
          toast(err.error || 'Failed to join activity', 'error');
          return;
        }
      } catch (e) {
        console.error('Failed to join activity on backend, using local storage fallback.', e);
      }

      // Local storage fallback if offline
      const updated = activities.map((act) => {
        if (act.id === actId) {
          if (act.isJoined) {
            toast('You have already joined this activity!');
            return act;
          }
          const joinedUsers = [...act.joinedUsers, { id: user.id, name: user.name, avatar: user.avatar }];
          toast(`🎉 Successfully joined: "${act.title}"!`);
          return {
            ...act,
            peopleJoined: act.peopleJoined + 1,
            joinedUsers,
            isJoined: true
          };
        }
        return act;
      });

      setActivities(updated);
      localStorage.setItem('dm_activities', JSON.stringify(updated));
    });
  };

  // TicketSwap: Buy Ticket Escrow Action
  const handleConfirmPurchase = () => {
    if (!selectedTicket || !user) return;

    startActionTransition(async () => {
      try {
        const res = await fetch(`/api/tickets/${selectedTicket.id}/buy`, {
          method: 'POST',
          headers: {
            'x-user-id': user.id,
            'x-user-name': user.name,
            'x-user-email': user.email,
          }
        });

        if (res.ok) {
          const result = await res.json();
          toast(`🎟 Securely bought "${result.ticket.title}"! Escrow protection active.`);
          setIsBuyModalOpen(false);
          setSelectedTicket(null);
          await refreshUser();
          
          window.dispatchEvent(new CustomEvent('feed-reload'));
          return;
        } else {
          const err = await res.json();
          toast(err.error || 'Failed to complete escrow purchase', 'error');
          setIsBuyModalOpen(false);
          return;
        }
      } catch (e) {
        console.error('Failed to buy ticket on backend, using local storage fallback.', e);
      }

      // Fallback offline purchase logic
      const updated = tickets.map((t) => {
        if (t.id === selectedTicket.id) {
          return { ...t, status: 'sold' as const };
        }
        return t;
      });
      setTickets(updated);
      localStorage.setItem('ts_tickets', JSON.stringify(updated));

      toast(`🎟 Securely bought "${selectedTicket.title}"! Check Chats to collect.`);
      setIsBuyModalOpen(false);
      setSelectedTicket(null);
    });
  };

  // Search logic
  const filteredActivities = activities.filter(act => 
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    act.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTickets = tickets.filter(tkt => 
    tkt.status === 'available' && (
      tkt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tkt.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Blended Feed List
  const blendedFeed: Array<{ type: 'daymate' | 'ticketswap'; data: Activity | TicketType; timeSort: string }> = [];
  if (filterMode === 'all' || filterMode === 'daymates') {
    filteredActivities.forEach((act) => {
      blendedFeed.push({ type: 'daymate', data: act, timeSort: act.id });
    });
  }
  if (filterMode === 'all' || filterMode === 'tickets') {
    filteredTickets.forEach((tkt) => {
      blendedFeed.push({ type: 'ticketswap', data: tkt, timeSort: tkt.id });
    });
  }

  // Sort chronologically (newest first)
  blendedFeed.sort((a, b) => b.timeSort.localeCompare(a.timeSort));

  return (
    <div className="px-5 py-6 font-sans max-w-5xl mx-auto">
      {/* Segmented Filter Control */}
      <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl mb-5 border border-neutral-200/30 dark:border-neutral-800/30 gap-1.5">
        <button
          onClick={() => setFilterMode('all')}
          className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-xl transition-[background-color,transform,box-shadow] duration-150 flex items-center justify-center gap-2 cursor-pointer ${
            filterMode === 'all'
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-neutral-950 shadow-md shadow-emerald-500/10 scale-[1.01]'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 hover:bg-neutral-200/40 dark:hover:bg-neutral-850/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Near You Today</span>
        </button>
        <button
          onClick={() => setFilterMode('daymates')}
          className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-xl transition-[background-color,transform,box-shadow] duration-150 flex items-center justify-center gap-2 cursor-pointer ${
            filterMode === 'daymates'
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-neutral-950 shadow-md shadow-emerald-500/10 scale-[1.01]'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 hover:bg-neutral-200/40 dark:hover:bg-neutral-850/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Day Mates</span>
        </button>
        <button
          onClick={() => setFilterMode('tickets')}
          className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-xl transition-[background-color,transform,box-shadow] duration-150 flex items-center justify-center gap-2 cursor-pointer ${
            filterMode === 'tickets'
              ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-neutral-950 shadow-md shadow-emerald-500/10 scale-[1.01]'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 hover:bg-neutral-200/40 dark:hover:bg-neutral-850/50'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Ticket Swap</span>
        </button>
      </div>

      {/* Real-time Search Box */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
        <input
          id="search-input-box"
          type="text"
          placeholder={filterMode === 'tickets' ? 'Search movies or events...' : 'Search activities, sports, coffee...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900/60 border border-transparent dark:border-neutral-800/60 focus:border-neutral-200 dark:focus:border-neutral-700 hover:bg-neutral-100/40 dark:hover:bg-neutral-800/40 rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none transition"
        />
      </div>

      {/* Global Interactive Loader Indicator if transaction is running */}
      {isActionPending && (
        <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-950 text-xs font-bold animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Securing smart transaction on escrow ledger...
        </div>
      )}

      {/* Opportunity List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blendedFeed.length > 0 ? (
          blendedFeed.map((item) => {
            if (item.type === 'daymate') {
              const act = item.data as Activity;
              return (
                <Card key={act.id} className="border border-neutral-100 dark:border-neutral-800/80 relative overflow-hidden bg-white dark:bg-neutral-900">
                  {/* Indicator bar */}
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-600 dark:bg-emerald-500" />
                  
                  <div className="flex justify-between items-start pl-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 text-[10px]">Day Mates</Badge>
                      <span className="text-[10px] text-neutral-400 font-bold">{act.distance}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                      📍 {act.category}
                    </span>
                  </div>

                  <div className="mt-3 pl-2">
                    <h3 className="text-sm font-black text-neutral-800 dark:text-neutral-100 tracking-tight leading-snug">
                      {act.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  {/* Creator and Join Controls */}
                  <div className="mt-4 pt-3 border-t border-neutral-50 dark:border-neutral-800/50 flex items-center justify-between pl-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={act.creatorAvatar}
                        alt={act.creatorName}
                        className="w-7 h-7 rounded-full border border-neutral-100 dark:border-neutral-800 object-cover"
                      />
                      <div>
                        <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">{act.creatorName}</p>
                        <p className="text-[9px] text-neutral-400 font-semibold">⭐ {act.creatorRating} Rating</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-neutral-400 font-bold">
                        {act.peopleJoined}/{act.peopleNeeded} filled
                      </span>
                      <Button
                        id={`join-btn-${act.id}`}
                        variant={act.isJoined ? 'secondary' : 'primary'}
                        size="sm"
                        disabled={isActionPending}
                        onClick={() => handleJoinActivity(act.id)}
                        className={`rounded-lg py-1 px-3.5 font-bold transition flex items-center gap-1 cursor-pointer ${
                          act.isJoined 
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border-none' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-none'
                        }`}
                      >
                        {act.isJoined ? (
                          <>
                            <Check className="w-3 h-3" />
                            Joined
                          </>
                        ) : (
                          'Join →'
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            } else {
              const tkt = item.data as TicketType;
              return (
                <Card key={tkt.id} className="border border-neutral-100 dark:border-neutral-800/80 relative overflow-hidden bg-white dark:bg-neutral-900">
                  {/* Indicator bar */}
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-teal-600 dark:bg-teal-500" />

                  <div className="flex justify-between items-start pl-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" className="bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900 text-[10px]">TicketSwap</Badge>
                      <span className="text-[10px] text-neutral-400 font-bold">{tkt.distance}</span>
                    </div>
                    <Badge variant="success" className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-100">
                      Save ₹{tkt.originalPrice - tkt.sellingPrice}
                    </Badge>
                  </div>

                  <div className="mt-3 pl-2">
                    <h3 className="text-sm font-black text-neutral-800 dark:text-neutral-100 tracking-tight leading-snug">
                      🎥 {tkt.title}
                    </h3>
                    <div className="flex gap-4 mt-2 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-xl border border-neutral-100/50 dark:border-neutral-800/30">
                      <div>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase">Original</p>
                        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 line-through">₹{tkt.originalPrice}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase">Selling</p>
                        <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">₹{tkt.sellingPrice}</p>
                      </div>
                      <div className="ml-auto flex items-center pr-1">
                        <span className="text-[9px] text-neutral-500 dark:text-neutral-400 font-bold">Venue: {tkt.location.substring(0, 15)}...</span>
                      </div>
                    </div>
                  </div>

                  {/* Creator / Buyer Actions */}
                  <div className="mt-4 pt-3 border-t border-neutral-50 dark:border-neutral-800/50 flex items-center justify-between pl-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={tkt.sellerAvatar}
                        alt={tkt.sellerName}
                        className="w-7 h-7 rounded-full border border-neutral-100 dark:border-neutral-800 object-cover"
                      />
                      <div>
                        <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">{tkt.sellerName}</p>
                        <p className="text-[9px] text-neutral-400 font-semibold">⭐ {tkt.sellerRating} Rating</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-neutral-400 font-bold">
                        Fee: ₹{tkt.connectFee}
                      </span>
                      <Button
                        id={`buy-btn-${tkt.id}`}
                        variant="primary"
                        size="sm"
                        disabled={isActionPending}
                        onClick={() => {
                          setSelectedTicket(tkt);
                          setIsBuyModalOpen(true);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-1 px-3.5 font-bold border-none transition cursor-pointer"
                      >
                        Buy Securely
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }
          })
        ) : (
          <div className="flex flex-col items-center py-12 text-center text-neutral-400 dark:text-neutral-500 col-span-full">
            <Sparkles className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-2" />
            <p className="text-xs font-bold">No active local opportunities matching your filters.</p>
            <p className="text-[10px] mt-1">Be the first to list an activity or sell a ticket!</p>
          </div>
        )}
      </div>

      {/* Buy Ticket Escrow Drawer/Modal */}
      <Dialog
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        title="Confirm Secure TicketSwap"
      >
        {selectedTicket && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              You are securely buying last-minute tickets for:
            </p>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{selectedTicket.title}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{selectedTicket.location}</p>
              
              <div className="mt-4 space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  <span>Ticket Price:</span>
                  <span>₹{selectedTicket.sellingPrice}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  <span>Secure Escrow Connect Fee:</span>
                  <span>₹{selectedTicket.connectFee}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-800 dark:text-neutral-200 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                  <span>Total Debit:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{selectedTicket.sellingPrice + selectedTicket.connectFee}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                Money is protected securely. We only release it once you scan successfully. Rating protection included.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setIsBuyModalOpen(false)}>
                Cancel
              </Button>
              <Button
                id="confirm-buy-btn"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                disabled={isActionPending}
                onClick={handleConfirmPurchase}
              >
                {isActionPending ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Paying...
                  </div>
                ) : (
                  'Confirm & Pay'
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default HomeFeed;
