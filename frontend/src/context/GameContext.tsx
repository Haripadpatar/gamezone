import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  username: string;
  email: string;
  isLoggedIn: boolean;
  referralCode: string;
  referredBy?: string;
  vipPoints: number;
  vipTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  avatarUrl: string;
  joinedAt: string;
  role: 'USER' | 'ADMIN';
  // Profile enhancements
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
  security2Fa: boolean;
  loginHistory: Array<{ ip: string; date: string; device: string; location: string }>;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BONUS' | 'REFERRAL';
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  paymentMethod: string;
  reference: string;
  date: string;
}

export interface BetLog {
  id: string;
  username: string;
  gameType: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  time: string;
}

export interface ChatMessage {
  id: string;
  username: string;
  vipTier: string;
  text: string;
  time: string;
  system?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BONUS' | 'REFERRAL' | 'SYSTEM';
  date: string;
  read: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  reply?: string;
  status: 'OPEN' | 'RESOLVED';
  date: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface GameContextType {
  user: User | null;
  balanceMode: 'REAL' | 'PRACTICE';
  
  // Real Wallet breakdown
  mainBalance: number;
  bonusBalance: number;
  lockedBalance: number;
  withdrawableBalance: number;
  
  practiceBalance: number;
  referralBalance: number;
  transactions: Transaction[];
  recentBets: BetLog[];
  myBets: BetLog[];
  leaderboard: Array<{ username: string; vipTier: string; totalWinnings: number; rank: number }>;
  
  // Modals toggles
  showAuthModal: boolean;
  authTab: 'login' | 'register';
  showWalletModal: boolean;
  walletTab: 'deposit' | 'withdraw' | 'history';
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;

  houseRtp: number;
  activeAds: {
    popup: boolean;
    sidebar: boolean;
    banner: boolean;
    rewarded: boolean;
  };
  
  // Notifications & Chats
  notifications: NotificationItem[];
  globalChatMessages: ChatMessage[];
  supportTickets: SupportTicket[];
  tournaments: Array<{ rank: number; username: string; points: number; prize: number }>;
  
  // CMS Fields
  termsOfService: string;
  privacyPolicy: string;
  faqItems: FAQItem[];
  blogAnnouncements: AnnouncementItem[];

  setAuthTab: (tab: 'login' | 'register') => void;
  setShowAuthModal: (show: boolean) => void;
  setWalletTab: (tab: 'deposit' | 'withdraw' | 'history') => void;
  setShowWalletModal: (show: boolean) => void;
  setBalanceMode: (mode: 'REAL' | 'PRACTICE') => void;
  
  login: (username: string, email: string, referredBy?: string) => boolean;
  register: (username: string, email: string, referredBy?: string) => boolean;
  logout: () => void;
  
  // Profile edits
  updateUserProfile: (fields: Partial<User>) => void;
  verifyKyc: (documentType: string, idNumber: string) => void;
  
  // Wallet operations
  deposit: (amount: number, method: string, reference: string) => Promise<boolean>;
  withdraw: (amount: number, method: string, accountDetails: string) => Promise<boolean>;
  cancelWithdrawal: (txId: string) => void;
  claimReferralEarnings: () => boolean;
  redeemPromoCode: (code: string) => { success: boolean; message: string };
  claimDailyBonus: () => { success: boolean; message: string };
  claimWeeklyBonus: () => { success: boolean; message: string };
  claimMonthlyBonus: () => { success: boolean; message: string };
  claimStreakBonus: () => { success: boolean; message: string };
  spinRewardsWheel: () => { success: boolean; multiplier: number; reward: number; message: string };
  watchRewardedAd: () => void;
  placeBet: (amount: number) => boolean;
  settleBet: (betAmount: number, winAmount: number, gameType: string, multiplier: number) => void;
  
  // Notification controls
  readNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Support ticket actions
  submitSupportTicket: (subject: string, category: string, message: string) => void;
  
  // Chat actions
  addGlobalChatMessage: (text: string) => void;
  tipUser: (targetUsername: string, amount: number) => boolean;

  // Admin Controls
  toggleAdState: (adKey: 'popup' | 'sidebar' | 'banner' | 'rewarded', enabled: boolean) => void;
  setHouseRtp: (rtp: number) => void;
  adminUpdateUserBalance: (username: string, amount: number, isReal: boolean) => void;
  adminUpdateTransactionStatus: (txId: string, status: 'SUCCESS' | 'FAILED') => void;
  adminApproveKyc: (username: string) => void;
  adminRejectKyc: (username: string) => void;
  adminAddFAQItem: (question: string, answer: string, category: string) => void;
  adminAddAnnouncement: (title: string, content: string) => void;
  adminUpdateCampaigns: (popup: boolean, sidebar: boolean, banner: boolean, rewarded: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const VIP_TIERS: Array<{ name: User['vipTier']; pointsRequired: number }> = [
  { name: 'BRONZE', pointsRequired: 0 },
  { name: 'SILVER', pointsRequired: 1000 },
  { name: 'GOLD', pointsRequired: 5000 },
  { name: 'PLATINUM', pointsRequired: 20000 },
  { name: 'DIAMOND', pointsRequired: 100000 },
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load user
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ag_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [balanceMode, setBalanceMode] = useState<'REAL' | 'PRACTICE'>(() => {
    const saved = localStorage.getItem('ag_balance_mode');
    return (saved as 'REAL' | 'PRACTICE') || 'PRACTICE';
  });

  // Wallet splits
  const [mainBalance, setMainBalance] = useState<number>(() => {
    const saved = localStorage.getItem('ag_main_balance');
    return saved ? parseFloat(saved) : 1000.00;
  });

  const [bonusBalance, setBonusBalance] = useState<number>(() => {
    const saved = localStorage.getItem('ag_bonus_balance');
    return saved ? parseFloat(saved) : 250.00; // start with some signup bonus
  });

  const [lockedBalance, setLockedBalance] = useState<number>(0);

  const [practiceBalance, setPracticeBalance] = useState<number>(() => {
    const saved = localStorage.getItem('ag_practice_balance');
    return saved ? parseFloat(saved) : 10000.00;
  });

  const [referralBalance, setReferralBalance] = useState<number>(() => {
    const saved = localStorage.getItem('ag_referral_balance');
    return saved ? parseFloat(saved) : 0.00;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ag_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [myBets, setMyBets] = useState<BetLog[]>(() => {
    const saved = localStorage.getItem('ag_my_bets');
    return saved ? JSON.parse(saved) : [];
  });

  const [houseRtp, setHouseRtpState] = useState<number>(() => {
    const saved = localStorage.getItem('ag_house_rtp');
    return saved ? parseFloat(saved) : 95.0;
  });

  const [activeAds, setActiveAds] = useState<{
    popup: boolean;
    sidebar: boolean;
    banner: boolean;
    rewarded: boolean;
  }>(() => {
    const saved = localStorage.getItem('ag_active_ads');
    return saved ? JSON.parse(saved) : { popup: true, sidebar: true, banner: true, rewarded: true };
  });

  // Notifications drawer
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('ag_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 'not_1', title: 'Welcome to AGX!', desc: 'Claim your daily allowance in the rewards lounge.', type: 'SYSTEM', date: new Date().toLocaleString(), read: false }
    ];
  });

  // Support Tickets
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('ag_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  // FAQ Items
  const [faqItems, setFaqItems] = useState<FAQItem[]>(() => {
    const saved = localStorage.getItem('ag_faqs');
    return saved ? JSON.parse(saved) : [
      { id: 'faq_1', question: 'How do I verify my KYC details?', answer: 'Navigate to the Profile Center, click Upload KYC documents, and submit your details. Verification takes 5 minutes.', category: 'Account' },
      { id: 'faq_2', question: 'What is the minimum withdrawal?', answer: 'The minimum withdrawal limit is $50. Withdrawals incur a flat 1.5% processing fee.', category: 'Wallet' },
      { id: 'faq_3', question: 'Is the game engine fair?', answer: 'Yes! We use SHA-256 HMAC seeds on our Provably Fair verifier, ensuring absolute mathematical transparency.', category: 'Games' }
    ];
  });

  // Announcement Blogs
  const [blogAnnouncements, setBlogAnnouncements] = useState<AnnouncementItem[]>(() => {
    const saved = localStorage.getItem('ag_announcements');
    return saved ? JSON.parse(saved) : [
      { id: 'ann_1', title: 'AGX V2.0 Platform Launch!', content: 'We are proud to introduce a complete wallet system, VIP progress bars, global chat room tipping, and responsible gaming features.', date: new Date().toLocaleDateString() }
    ];
  });

  // Tournaments Standings
  const [tournaments, setTournaments] = useState<Array<{ rank: number; username: string; points: number; prize: number }>>([]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTab, setWalletTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [recentBets, setRecentBets] = useState<BetLog[]>([]);
  const [leaderboard] = useState<Array<{ username: string; vipTier: string; totalWinnings: number; rank: number }>>([]);
  const [globalChatMessages, setGlobalChatMessages] = useState<ChatMessage[]>([]);

  // Computed withdrawable balance
  const withdrawableBalance = Math.max(0, mainBalance);

  // Sync state values to local storage
  useEffect(() => {
    if (user) localStorage.setItem('ag_user', JSON.stringify(user));
    else localStorage.removeItem('ag_user');
  }, [user]);

  useEffect(() => { localStorage.setItem('ag_balance_mode', balanceMode); }, [balanceMode]);
  useEffect(() => { localStorage.setItem('ag_main_balance', mainBalance.toString()); }, [mainBalance]);
  useEffect(() => { localStorage.setItem('ag_bonus_balance', bonusBalance.toString()); }, [bonusBalance]);
  useEffect(() => { localStorage.setItem('ag_practice_balance', practiceBalance.toString()); }, [practiceBalance]);
  useEffect(() => { localStorage.setItem('ag_referral_balance', referralBalance.toString()); }, [referralBalance]);
  useEffect(() => { localStorage.setItem('ag_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('ag_my_bets', JSON.stringify(myBets)); }, [myBets]);
  useEffect(() => { localStorage.setItem('ag_house_rtp', houseRtp.toString()); }, [houseRtp]);
  useEffect(() => { localStorage.setItem('ag_active_ads', JSON.stringify(activeAds)); }, [activeAds]);
  useEffect(() => { localStorage.setItem('ag_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('ag_tickets', JSON.stringify(supportTickets)); }, [supportTickets]);
  useEffect(() => { localStorage.setItem('ag_faqs', JSON.stringify(faqItems)); }, [faqItems]);
  useEffect(() => { localStorage.setItem('ag_announcements', JSON.stringify(blogAnnouncements)); }, [blogAnnouncements]);

  // Periodic loaders and mock ticker loops
  useEffect(() => {
    const mockUsernames = ['MegaWinner', 'CryptoNinja', 'DiceKing', 'PlinkoPro', 'GamerX', 'LuckyStriker', 'ShadowBet', 'SpinQueen', 'ApexPredator', 'CasinoBoss'];
    const chatFeed = [
      'Just hit 5x in Aviator! 🚀',
      'Plinko dropped on 8x bucket let\'s go',
      'Anyone got a good coupon code?',
      'Try ANTIGRAVITY50 for a bonus check',
      'Admin, check ticket please',
      'Double check client seeds on Provably Fair page',
      'Nice blackjack split win!',
      'Streak rewards claim today feels good'
    ];

    // Seed global chat messages
    const initialChat: ChatMessage[] = Array.from({ length: 6 }).map((_, idx) => {
      const username = mockUsernames[Math.floor(Math.random() * mockUsernames.length)];
      return {
        id: `chat_${Date.now() - idx * 20000}`,
        username,
        vipTier: ['BRONZE', 'SILVER', 'GOLD'][Math.floor(Math.random() * 3)],
        text: chatFeed[Math.floor(Math.random() * chatFeed.length)],
        time: new Date(Date.now() - idx * 20000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }).reverse();
    setGlobalChatMessages(initialChat);

    // Seed tournaments roster
    const tournamentRoster = mockUsernames.map((username, index) => ({
      rank: index + 1,
      username,
      points: Math.floor(Math.random() * 3000) + 200,
      prize: [1000, 500, 250, 100, 100, 50, 50, 50, 50, 50][index] || 10
    })).sort((a, b) => b.points - a.points)
       .map((item, idx) => ({ ...item, rank: idx + 1 }));
    setTournaments(tournamentRoster);

    // Ticker loops
    const chatInterval = setInterval(() => {
      const username = mockUsernames[Math.floor(Math.random() * mockUsernames.length)];
      const text = chatFeed[Math.floor(Math.random() * chatFeed.length)];
      const newMsg: ChatMessage = {
        id: `chat_${Date.now()}`,
        username,
        vipTier: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'][Math.floor(Math.random() * 4)],
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setGlobalChatMessages(prev => [...prev.slice(1), newMsg]);
    }, 9000);

    return () => {
      clearInterval(chatInterval);
    };
  }, []);

  const login = (username: string, email: string, referredBy?: string): boolean => {
    const role = username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER';
    const newRefCode = username.toUpperCase().slice(0, 4) + Math.floor(Math.random() * 1000);
    const mockUser: User = {
      username,
      email,
      isLoggedIn: true,
      referralCode: newRefCode,
      referredBy,
      vipPoints: 350,
      vipTier: 'BRONZE',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      joinedAt: new Date().toLocaleDateString(),
      role,
      emailVerified: true,
      phoneVerified: false,
      kycStatus: 'UNVERIFIED',
      security2Fa: false,
      loginHistory: [
        { ip: '192.168.1.1', date: new Date().toLocaleString(), device: 'Macbook (Safari)', location: 'New York, US' }
      ]
    };
    setUser(mockUser);
    addNotification('Login Success', `Logged in successfully from ${mockUser.loginHistory[0].ip}.`, 'SYSTEM');
    return true;
  };

  const register = (username: string, email: string, referredBy?: string): boolean => {
    return login(username, email, referredBy);
  };

  const logout = () => {
    setUser(null);
    setBalanceMode('PRACTICE');
  };

  const updateUserProfile = (fields: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...fields } : null);
  };

  const verifyKyc = (_documentType: string, _idNumber: string) => {
    if (!user) return;
    updateUserProfile({ kycStatus: 'PENDING' });
    addNotification('KYC Documents Submitted', 'Your verification request is pending review by our administrative division.', 'SYSTEM');
  };

  const deposit = async (amount: number, method: string, reference: string): Promise<boolean> => {
    if (!user) return false;
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          type: 'DEPOSIT',
          amount,
          status: 'PENDING',
          paymentMethod: method,
          reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleString()
        };
        setTransactions(prev => [newTx, ...prev]);
        addNotification('Deposit Submitted', `Your deposit of $${amount.toFixed(2)} is pending reference check.`, 'DEPOSIT');
        resolve(true);
      }, 1200);
    });
  };

  const withdraw = async (amount: number, method: string, accountDetails: string): Promise<boolean> => {
    if (!user || withdrawableBalance < amount) return false;

    // Deduct main wallet balance instantly & lock funds
    setMainBalance(prev => prev - amount);
    setLockedBalance(prev => prev + amount);

    return new Promise((resolve) => {
      setTimeout(() => {
        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          type: 'WITHDRAWAL',
          amount,
          status: 'PENDING',
          paymentMethod: method,
          reference: `WD-${Math.floor(100000 + Math.random() * 900000)} (${accountDetails})`,
          date: new Date().toLocaleString()
        };
        setTransactions(prev => [newTx, ...prev]);
        addNotification('Withdrawal Placed', `Outward request for $${amount.toFixed(2)} submitted. Processing fee applied.`, 'WITHDRAWAL');
        resolve(true);
      }, 1200);
    });
  };

  const cancelWithdrawal = (txId: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId && tx.status === 'PENDING') {
        // Return from locked to main wallet balance
        setMainBalance(bal => bal + tx.amount);
        setLockedBalance(l => Math.max(0, l - tx.amount));
        addNotification('Withdrawal Cancelled', `Transaction ${tx.reference} successfully voided. Funds returned.`, 'WITHDRAWAL');
        return { ...tx, status: 'FAILED' as const };
      }
      return tx;
    }));
  };

  const claimReferralEarnings = (): boolean => {
    if (!user || referralBalance <= 0) return false;
    setMainBalance(prev => prev + referralBalance);
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'REFERRAL',
      amount: referralBalance,
      status: 'SUCCESS',
      paymentMethod: 'AFFILIATE_TRANSFER',
      reference: `REF-CLAIM-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString()
    };
    setTransactions(prev => [newTx, ...prev]);
    addNotification('Referrals Claimed', `Credited $${referralBalance.toFixed(2)} to main wallet from partner network.`, 'REFERRAL');
    setReferralBalance(0);
    return true;
  };

  const redeemPromoCode = (code: string): { success: boolean; message: string } => {
    if (!user) return { success: false, message: 'Please log in first' };
    const cleanedCode = code.trim().toUpperCase();

    if (cleanedCode === 'ANTIGRAVITY50') {
      // Add bonus balance
      setBonusBalance(prev => prev + 50.00);
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        type: 'BONUS',
        amount: 50.00,
        status: 'SUCCESS',
        paymentMethod: 'PROMO_CODE',
        reference: `PROMO-${cleanedCode}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleString()
      };
      setTransactions(prev => [newTx, ...prev]);
      addNotification('Promo Redeemed', 'Received $50.00 Promo Coupon in bonus balance wallet.', 'BONUS');
      return { success: true, message: 'Promo code applied! $50.00 bonus added.' };
    }

    return { success: false, message: 'Invalid or expired promotional code' };
  };

  const claimDailyBonus = (): { success: boolean; message: string } => {
    if (!user) return { success: false, message: 'Please log in first' };
    const lastClaim = localStorage.getItem(`daily_${user.username}`);
    const today = new Date().toDateString();

    if (lastClaim === today) {
      return { success: false, message: 'Daily bonus already claimed today.' };
    }

    setBonusBalance(prev => prev + 15.00);
    localStorage.setItem(`daily_${user.username}`, today);
    addNotification('Daily Reward Claimed', 'Credited $15.00 daily allowance to bonus wallet.', 'BONUS');
    return { success: true, message: 'Daily bonus claimed successfully! Added $15.00 to bonus balance.' };
  };

  const claimWeeklyBonus = (): { success: boolean; message: string } => {
    if (!user) return { success: false, message: 'Please log in first' };
    setBonusBalance(prev => prev + 50.00);
    addNotification('Weekly Reward Claimed', 'Credited $50.00 weekly allowance to bonus wallet.', 'BONUS');
    return { success: true, message: 'Weekly loyalty bonus claimed! Added $50.00 to bonus wallet.' };
  };

  const claimMonthlyBonus = (): { success: boolean; message: string } => {
    if (!user) return { success: false, message: 'Please log in first' };
    setBonusBalance(prev => prev + 150.00);
    addNotification('Monthly Reward Claimed', 'Credited $150.00 monthly allowance to bonus wallet.', 'BONUS');
    return { success: true, message: 'Monthly loyalty bonus claimed! Added $150.00 to bonus wallet.' };
  };

  const claimStreakBonus = (): { success: boolean; message: string } => {
    if (!user) return { success: false, message: 'Please log in first' };
    setBonusBalance(prev => prev + 30.00);
    addNotification('Streak Payout Claimed', 'Streak check completed! Credited $30.00 bonus.', 'BONUS');
    return { success: true, message: 'Login streak bonus claimed! Added $30.00 to bonus wallet.' };
  };

  const spinRewardsWheel = (): { success: boolean; multiplier: number; reward: number; message: string } => {
    if (!user) return { success: false, multiplier: 0, reward: 0, message: 'Please log in first' };
    const values = [0.2, 0.5, 1.0, 2.0, 5.0];
    const pickedMult = values[Math.floor(Math.random() * values.length)];
    const prize = parseFloat((pickedMult * 10).toFixed(2));
    setBonusBalance(prev => prev + prize);
    addNotification('Spin Rewards Claimed', `Landed on ${pickedMult}x! Received $${prize.toFixed(2)} bonus.`, 'BONUS');
    return { success: true, multiplier: pickedMult, reward: prize, message: `Landed on ${pickedMult}x! Received $${prize.toFixed(2)} bonus credits.` };
  };

  const watchRewardedAd = () => {
    setPracticeBalance(prev => prev + 50.00);
    addNotification('Ad Reward Unlocked', 'Grants $50.00 Practice credits on rewarded ad watch.', 'BONUS');
  };

  const placeBet = (amount: number): boolean => {
    if (balanceMode === 'REAL') {
      if (mainBalance + bonusBalance < amount) return false;
      
      // Deduct from bonus balance first, then main balance
      if (bonusBalance >= amount) {
        setBonusBalance(prev => prev - amount);
      } else {
        const remainder = amount - bonusBalance;
        setBonusBalance(0);
        setMainBalance(prev => prev - remainder);
      }
    } else {
      if (practiceBalance < amount) return false;
      setPracticeBalance(prev => prev - amount);
    }
    return true;
  };

  const settleBet = (betAmount: number, winAmount: number, gameType: string, multiplier: number) => {
    if (balanceMode === 'REAL') {
      // Winnings are credited back into mainBalance
      setMainBalance(prev => prev + winAmount);
    } else {
      setPracticeBalance(prev => prev + winAmount);
    }

    // VIP loyalty points
    if (balanceMode === 'REAL' && user) {
      const pointsGained = Math.max(1, Math.floor(betAmount / 10));
      setUser(prev => {
        if (!prev) return null;
        const newPoints = prev.vipPoints + pointsGained;
        let nextTier: User['vipTier'] = 'BRONZE';
        for (const tier of VIP_TIERS) {
          if (newPoints >= tier.pointsRequired) nextTier = tier.name;
        }
        return { ...prev, vipPoints: newPoints, vipTier: nextTier };
      });

      // Referrals commissions log
      if (user.referredBy && winAmount === 0) {
        const commission = parseFloat((betAmount * 0.015).toFixed(2)); // 1.5% cashback
        setReferralBalance(prev => prev + commission);
      }
    }

    const liveLog: BetLog = {
      id: `bet_${Date.now()}`,
      username: user ? user.username : 'PracticeUser',
      gameType,
      betAmount,
      multiplier,
      payout: winAmount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setRecentBets(prev => [liveLog, ...prev.slice(0, 15)]);
    
    // Save to user history if logged in
    if (user) {
      setMyBets(prev => [liveLog, ...prev.slice(0, 49)]);
    }
  };

  // Notification controls
  const addNotification = (title: string, desc: string, type: NotificationItem['type']) => {
    const newAlert: NotificationItem = {
      id: `not_${Date.now()}`,
      title,
      desc,
      type,
      date: new Date().toLocaleString(),
      read: false
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  const readNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Support ticket actions
  const submitSupportTicket = (subject: string, category: string, message: string) => {
    const newTicket: SupportTicket = {
      id: `tix_${Date.now()}`,
      subject,
      category,
      message,
      status: 'OPEN',
      date: new Date().toLocaleString()
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    addNotification('Ticket Submitted', `Your ticket #${newTicket.id} is registered in the queue.`, 'SYSTEM');
  };

  // Chat message additions
  const addGlobalChatMessage = (text: string) => {
    if (!user) return;
    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      username: user.username,
      vipTier: user.vipTier,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setGlobalChatMessages(prev => [...prev.slice(1), newMsg]);
  };

  // Tipping action
  const tipUser = (targetUsername: string, amount: number): boolean => {
    if (!user) return false;
    
    // Tip with practice credits
    if (practiceBalance < amount) return false;
    
    setPracticeBalance(prev => prev - amount);
    const newMsg: ChatMessage = {
      id: `chat_tip_${Date.now()}`,
      username: 'SYSTEM',
      vipTier: 'ADMIN',
      text: `${user.username} tipped ${targetUsername} $${amount.toFixed(2)} practice coins! 🎁`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      system: true
    };
    setGlobalChatMessages(prev => [...prev.slice(1), newMsg]);
    return true;
  };

  // Admin controls
  const toggleAdState = (adKey: 'popup' | 'sidebar' | 'banner' | 'rewarded', enabled: boolean) => {
    setActiveAds((prev: any) => ({ ...prev, [adKey]: enabled }));
  };

  const setHouseRtp = (rtp: number) => {
    setHouseRtpState(rtp);
  };

  const adminUpdateUserBalance = (_username: string, amount: number, isReal: boolean) => {
    if (isReal) {
      setMainBalance(amount);
    } else {
      setPracticeBalance(amount);
    }
  };

  const adminUpdateTransactionStatus = (txId: string, status: 'SUCCESS' | 'FAILED') => {
    setTransactions((prev: any[]) => prev.map(tx => {
      if (tx.id === txId) {
        // If it's a withdrawal and status is failed, credit back main balance
        if (tx.type === 'WITHDRAWAL') {
          setLockedBalance(l => Math.max(0, l - tx.amount));
          if (status === 'FAILED') {
            setMainBalance(bal => bal + tx.amount);
          }
        }
        // If it's a deposit and status is approved, credit main balance
        if (tx.type === 'DEPOSIT' && status === 'SUCCESS') {
          setMainBalance(bal => bal + tx.amount);
        }
        
        const notifyTitle = tx.type === 'DEPOSIT' ? 'Deposit Confirmed' : 'Withdrawal Executed';
        const notifyDesc = status === 'SUCCESS' 
          ? `Your financial ticket for $${tx.amount.toFixed(2)} was successfully processed.`
          : `Your financial ticket for $${tx.amount.toFixed(2)} was declined. Check details.`;
        addNotification(notifyTitle, notifyDesc, tx.type === 'DEPOSIT' ? 'DEPOSIT' : 'WITHDRAWAL');

        return { ...tx, status };
      }
      return tx;
    }));
  };

  const adminApproveKyc = (username: string) => {
    if (user && user.username === username) {
      updateUserProfile({ kycStatus: 'VERIFIED' });
      addNotification('KYC Verified', 'Your identity details have been successfully verified.', 'SYSTEM');
    }
  };

  const adminRejectKyc = (username: string) => {
    if (user && user.username === username) {
      updateUserProfile({ kycStatus: 'UNVERIFIED' });
      addNotification('KYC Verification Failed', 'Your identity details were rejected. Please upload valid proof.', 'SYSTEM');
    }
  };

  const adminAddFAQItem = (question: string, answer: string, category: string) => {
    const newItem: FAQItem = {
      id: `faq_${Date.now()}`,
      question,
      answer,
      category
    };
    setFaqItems(prev => [...prev, newItem]);
  };

  const adminAddAnnouncement = (title: string, content: string) => {
    const newItem: AnnouncementItem = {
      id: `ann_${Date.now()}`,
      title,
      content,
      date: new Date().toLocaleDateString()
    };
    setBlogAnnouncements(prev => [newItem, ...prev]);
  };

  const adminUpdateCampaigns = (popup: boolean, sidebar: boolean, banner: boolean, rewarded: boolean) => {
    setActiveAds({ popup, sidebar, banner, rewarded });
  };

  // Static Terms and Policies for CMS
  const termsOfService = "Welcome to AGX. By using our platform, you agree to our 18+ responsible wagering limits. Game outcomes are verified mathematically by cryptographical SHA-256 HMAC algorithms.";
  const privacyPolicy = "AGX guarantees player anonymity. We do not store KYC documents on public cloud files, and all financial transactions are protected by end-to-end socket encryptions.";

  return (
    <GameContext.Provider value={{
      user,
      balanceMode,
      mainBalance,
      bonusBalance,
      lockedBalance,
      withdrawableBalance,
      practiceBalance,
      referralBalance,
      transactions,
      recentBets,
      myBets,
      leaderboard,
      showAuthModal,
      authTab,
      showWalletModal,
      walletTab,
      showProfileModal,
      setShowProfileModal,
      houseRtp,
      activeAds,
      notifications,
      globalChatMessages,
      supportTickets,
      tournaments,
      termsOfService,
      privacyPolicy,
      faqItems,
      blogAnnouncements,
      setAuthTab,
      setShowAuthModal,
      setWalletTab,
      setShowWalletModal,
      setBalanceMode,
      login,
      register,
      logout,
      updateUserProfile,
      verifyKyc,
      deposit,
      withdraw,
      cancelWithdrawal,
      claimReferralEarnings,
      redeemPromoCode,
      claimDailyBonus,
      claimWeeklyBonus,
      claimMonthlyBonus,
      claimStreakBonus,
      spinRewardsWheel,
      watchRewardedAd,
      placeBet,
      settleBet,
      readNotification,
      clearNotifications,
      submitSupportTicket,
      addGlobalChatMessage,
      tipUser,
      toggleAdState,
      setHouseRtp,
      adminUpdateUserBalance,
      adminUpdateTransactionStatus,
      adminApproveKyc,
      adminRejectKyc,
      adminAddFAQItem,
      adminAddAnnouncement,
      adminUpdateCampaigns
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
