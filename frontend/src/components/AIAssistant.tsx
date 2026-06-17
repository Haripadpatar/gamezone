import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Brain, X, Send, BarChart2, Award, Sparkles } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const { myBets } = useGame();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'stats' | 'recommend'>('chat');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your AGX AI Guide. How can I assist you with your gaming experience today?' }
  ]);
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-cyber-gradient text-white rounded-full shadow-neon-purple shadow-2xl transition-all hover:scale-105 animate-pulse"
        title="Ask AGX AI Assistant"
      >
        <Brain size={24} />
      </button>
    );
  }

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputVal.trim();
    if (!query) return;

    const newMessages = [...messages, { sender: 'user' as const, text: query }];
    setMessages(newMessages);
    setInputVal('');

    // Generate AI response based on keyword queries
    setTimeout(() => {
      let reply = "I'm analyzing that query. For detailed help, check our 24/7 Live Support or Telegram channel!";
      const q = query.toLowerCase();

      if (q.includes('mines')) {
        reply = "Mines features a 5x5 board. Uncover crystals to multiply your payout. You can cash out anytime, but hitting a mine sweep voids all wagers in that round.";
      } else if (q.includes('vip') || q.includes('loyalty')) {
        reply = "Our VIP club progresses from Bronze to Diamond. Every $10 wagered in real cash earns 1 loyalty point. Higher tiers unlock up to 1.2% cashbacks, weekly checks, and personal account managers.";
      } else if (q.includes('responsible') || q.includes('limit') || q.includes('addiction')) {
        reply = "AGX promotes responsible gaming. You can set weekly deposit boundaries in your Profile or request self-exclusions. Play with practice coins to practice safely!";
      } else if (q.includes('deposit') || q.includes('wallet')) {
        reply = "We separate wallets into Main (withdrawable) and Bonus (promo coupon wagers). Deposits can be made via UPI/QR codes or Card gates and require administrative approvals.";
      } else if (q.includes('fair') || q.includes('seed')) {
        reply = "All game outcomes are provably fair. You can check the Server Seed hash, customized Client Seed, and Nonce in our Provably Fair verifier tab to mathematically verify RNG runs.";
      }

      setMessages([...newMessages, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  // AI Analytics computations
  const totalBets = myBets.length;
  const winBets = myBets.filter(b => b.payout > 0).length;
  const winRate = totalBets > 0 ? Math.round((winBets / totalBets) * 100) : 0;
  
  // Find favorite game
  const gameCounts = myBets.reduce((acc, b) => {
    acc[b.gameType] = (acc[b.gameType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let favGame = 'None yet';
  let maxCount = 0;
  Object.entries(gameCounts).forEach(([game, count]) => {
    if (count > maxCount) {
      favGame = game;
      maxCount = count;
    }
  });

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 rounded-2xl glass-panel-glow border border-dark-700 shadow-2xl overflow-hidden flex flex-col max-h-[500px] animate-scale-up">
      
      {/* Header */}
      <div className="p-4 bg-cyber-gradient text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain size={18} />
          <div>
            <h3 className="text-xs font-black">AGX AI Assistant</h3>
            <span className="text-[8px] text-white/75 font-semibold">Active RNG & Insights Core</span>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/10 rounded-lg text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-750 bg-dark-900/50 text-[10px] font-bold text-gray-400">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 text-center border-b ${activeTab === 'chat' ? 'text-neon-cyan border-neon-cyan' : 'border-transparent'}`}
        >
          AI Chat
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 text-center border-b ${activeTab === 'stats' ? 'text-neon-cyan border-neon-cyan' : 'border-transparent'}`}
        >
          AI Analytics
        </button>
        <button 
          onClick={() => setActiveTab('recommend')}
          className={`flex-1 py-2 text-center border-b ${activeTab === 'recommend' ? 'text-neon-cyan border-neon-cyan' : 'border-transparent'}`}
        >
          AI Offers
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[250px] max-h-[300px] bg-dark-950/20 text-xs">
        
        {activeTab === 'chat' && (
          <div className="space-y-3">
            {messages.map((m, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-xl leading-normal max-w-[85%] ${
                  m.sender === 'ai' 
                    ? 'bg-dark-900 border border-dark-800 text-gray-300' 
                    : 'bg-neon-purple/10 border border-neon-purple/20 text-white ml-auto'
                }`}
              >
                {m.text}
              </div>
            ))}
            
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {['Explain Mines', 'Wallet help', 'VIP guidelines', 'Responsible gaming'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSend(p)}
                  className="px-2 py-1 bg-dark-900/60 hover:bg-dark-800 border border-dark-800 text-[9px] rounded-lg text-neon-cyan font-bold transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-dark-900/40 border border-dark-800 rounded-xl">
                <span className="text-[9px] text-gray-500 uppercase font-bold">AI Favorite Game</span>
                <div className="text-sm font-extrabold text-white mt-0.5 truncate">{favGame}</div>
              </div>
              <div className="p-2.5 bg-dark-900/40 border border-dark-800 rounded-xl">
                <span className="text-[9px] text-gray-500 uppercase font-bold">Estimated Win Rate</span>
                <div className="text-sm font-extrabold text-neon-emerald mt-0.5">{winRate}%</div>
              </div>
            </div>

            <div className="p-3 bg-dark-900/20 border border-dark-800 rounded-xl space-y-1.5">
              <h4 className="text-[10px] uppercase font-bold text-gray-450 flex items-center gap-1.5">
                <BarChart2 size={12} className="text-neon-cyan" /> AI Behavioral Insights
              </h4>
              <p className="text-[10px] text-gray-400 leading-normal">
                {totalBets < 5 
                  ? "Play more game cycles to build up AI prediction models and receive custom recommendations."
                  : `Our models note that you perform best in ${favGame}. Try adjusting risks settings to optimize yield ratios.`
                }
              </p>
            </div>
          </div>
        )}

        {activeTab === 'recommend' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-dark-900/40 border border-dark-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="text-[10px] uppercase font-bold text-neon-cyan flex items-center gap-1">
                  <Sparkles size={10} /> Recommended Game
                </h4>
                <span className="text-[8px] bg-neon-pink text-white font-black px-1.5 py-0.5 rounded">RTP 97.4%</span>
              </div>
              <div className="font-extrabold text-white text-xs">Aviator</div>
              <p className="text-[9px] text-gray-400 leading-normal">Our algorithms note a high probability streak on flight multiplier ranges today. Try placing a practice roll!</p>
            </div>

            <div className="p-3.5 bg-neon-purple/5 border border-neon-purple/20 rounded-xl space-y-1.5">
              <h4 className="text-[10px] uppercase font-bold text-neon-purple flex items-center gap-1">
                <Award size={10} /> Personalized Bonus Offer
              </h4>
              <div className="font-bold text-white text-xs">Reload Code: AGXRELOAD</div>
              <p className="text-[9px] text-gray-450 leading-normal">Enter this code on your rewards wallet portal to claim a 20% match deposit booster.</p>
            </div>
          </div>
        )}

      </div>

      {/* Input Form */}
      {activeTab === 'chat' && (
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-3 border-t border-dark-750 bg-dark-900/40 flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI anything..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-dark-950 border border-dark-750 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-neon-cyan"
          />
          <button 
            type="submit"
            className="p-2 bg-cyber-gradient text-white rounded-xl hover:opacity-90 shadow-md shadow-neon-purple/20"
          >
            <Send size={14} />
          </button>
        </form>
      )}

    </div>
  );
};
