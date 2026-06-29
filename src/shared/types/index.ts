export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rating: number;
  activitiesJoinedCount: number;
  ticketsSoldCount: number;
  ticketsBoughtCount: number;
  identityVerified: boolean;
  walletBalance: number;
}

export interface Activity {
  id: string;
  title: string;
  category: 'Cricket' | 'Coffee' | 'Movie' | 'Lunch' | 'Badminton' | 'Pizza' | 'Other';
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRating: number;
  peopleJoined: number;
  peopleNeeded: number;
  joinedUsers: { id: string; name: string; avatar: string }[];
  time: string;
  location: string;
  distance: string;
  isJoined?: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  category: 'Movie' | 'F1' | 'Concert' | 'Sports' | 'Drama' | 'Other';
  originalPrice: number;
  sellingPrice: number;
  connectFee: number;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number;
  quantity: number;
  location: string;
  distance: string;
  verified: boolean;
  status: 'available' | 'sold' | 'requested';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

export interface Conversation {
  id: string;
  type: 'daymate' | 'ticketswap';
  targetId: string; // Activity ID or Ticket ID
  targetTitle: string; // Movie name or Activity Title
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerRating: number;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  text: string;
  type: 'daymate' | 'ticketswap' | 'chat' | 'system' | 'payment';
  timestamp: string;
  read: boolean;
}
