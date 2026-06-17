import React, { useState } from 'react';
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
import { Mines } from './pages/games/Mines';
import { Crash } from './pages/games/Crash';
import { Slots } from './pages/games/Slots';
import { Roulette } from './pages/games/Roulette';
import { Plinko } from './pages/games/Plinko';
import { WheelSpin } from './pages/games/WheelSpin';
import { Dice } from './pages/games/Dice';
import { CardGames } from './pages/games/CardGames';
import { ColorPrediction } from './pages/games/ColorPrediction';
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onSelectGame={(gameId) => setActiveTab(gameId)} />;
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
      case 'admin':
        return user?.role === 'ADMIN' ? <AdminDashboard /> : <Home onSelectGame={(gameId) => setActiveTab(gameId)} />;
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
      default:
        return <Home onSelectGame={(gameId) => setActiveTab(gameId)} />;
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
          setActiveTab={setActiveTab} 
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
