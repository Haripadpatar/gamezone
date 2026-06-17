import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Leaderboard } from './pages/Leaderboard';
import { VIP } from './pages/VIP';
import { Referral } from './pages/Referral';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProvablyFair } from './pages/ProvablyFair';
import { Tournaments } from './pages/Tournaments';
import { Analytics } from './pages/Analytics';
import { Mines } from './pages/games/Mines';
import { Crash } from './pages/games/Crash';
import { Slots } from './pages/games/Slots';
import { Roulette } from './pages/games/Roulette';
import { Plinko } from './pages/games/Plinko';
import { WheelSpin } from './pages/games/WheelSpin';
import { Dice } from './pages/games/Dice';
import { CardGames } from './pages/games/CardGames';
import { ColorPrediction } from './pages/games/ColorPrediction';
import { DragonTiger } from './pages/games/DragonTiger';
import { TeenPatti } from './pages/games/TeenPatti';
import { Ludo } from './pages/games/Ludo';
import { AndarBahar } from './pages/games/AndarBahar';
import { Baccarat } from './pages/games/Baccarat';
import { Poker } from './pages/games/Poker';
import { AuthModal } from './components/AuthModal';
import { WalletModal } from './components/WalletModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AIAssistant } from './components/AIAssistant';
import { LiveChatSupport } from './components/LiveChatSupport';
import { GlobalChat } from './components/GlobalChat';
import { AdsSystem } from './components/AdsSystem';

const MainLayout: React.FC = () => {
  const { user } = useGame();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const pathMap: Record<string, string> = {
    '/': 'home',
    '/leaderboard': 'leaderboard',
    '/vip': 'vip',
    '/referral': 'referral',
    '/provably': 'provably',
    '/tournaments': 'tournaments',
    '/admin': 'admin',
    '/mines': 'mines',
    '/aviator': 'crash',
    '/crash': 'crash',
    '/slots': 'slots',
    '/roulette': 'roulette',
    '/plinko': 'plinko',
    '/wheel': 'wheel',
    '/dice': 'dice',
    '/blackjack': 'blackjack',
    '/color': 'color',
    '/dragon-vs-tiger': 'dragon_tiger',
    '/teen-patti': 'teen_patti',
    '/ludo': 'ludo',
    '/andar-bahar': 'andar_bahar',
    '/baccarat': 'baccarat',
    '/poker': 'poker',
    '/analytics': 'analytics'
  };

  const tabMap: Record<string, string> = {
    'home': '/',
    'leaderboard': '/leaderboard',
    'vip': '/vip',
    'referral': '/referral',
    'provably': '/provably',
    'tournaments': '/tournaments',
    'admin': '/admin',
    'mines': '/mines',
    'crash': '/aviator',
    'slots': '/slots',
    'roulette': '/roulette',
    'plinko': '/plinko',
    'wheel': '/wheel',
    'dice': '/dice',
    'blackjack': '/blackjack',
    'color': '/color',
    'dragon_tiger': '/dragon-vs-tiger',
    'teen_patti': '/teen-patti',
    'ludo': '/ludo',
    'andar_bahar': '/andar-bahar',
    'baccarat': '/baccarat',
    'poker': '/poker',
    'analytics': '/analytics'
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const tab = pathMap[path] || 'home';
      setActiveTab(tab);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    const path = tabMap[tab] || '/';
    if (window.location.pathname !== path) {
      window.history.pushState({ tab }, '', path);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onSelectGame={(gameId) => handleSetActiveTab(gameId)} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'vip':
        return <VIP />;
      case 'referral':
        return <Referral />;
      case 'provably':
        return <ProvablyFair />;
      case 'tournaments':
        return <Tournaments />;
      case 'analytics':
        return <Analytics />;
      case 'admin':
        return user?.role === 'ADMIN' ? <AdminDashboard /> : <Home onSelectGame={(gameId) => handleSetActiveTab(gameId)} />;
      // Games
      case 'mines':
        return <Mines />;
      case 'crash':
        return <Crash />;
      case 'slots':
        return <Slots />;
      case 'roulette':
        return <Roulette />;
      case 'plinko':
        return <Plinko />;
      case 'wheel':
        return <WheelSpin />;
      case 'dice':
        return <Dice />;
      case 'blackjack':
        return <CardGames />;
      case 'color':
        return <ColorPrediction />;
      case 'dragon_tiger':
        return <DragonTiger />;
      case 'teen_patti':
        return <TeenPatti />;
      case 'ludo':
        return <Ludo />;
      case 'andar_bahar':
        return <AndarBahar />;
      case 'baccarat':
        return <Baccarat />;
      case 'poker':
        return <Poker />;
      default:
        return <Home onSelectGame={(gameId) => handleSetActiveTab(gameId)} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          activeTab={activeTab} 
          setActiveTab={handleSetActiveTab} 
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {/* Load Pop-up Ads */}
          <AdsSystem placement="popup" />
          
          {renderContent()}
        </main>
        
        {/* Right global chat sidebar drawer */}
        <GlobalChat />
      </div>

      {/* Global Overlays & Widgets */}
      <AuthModal />
      <WalletModal />
      <UserProfileModal />
      <AIAssistant />
      <LiveChatSupport />
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <MainLayout />
    </GameProvider>
  );
}

export default App;
