import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { MessageSquare, Send, X, Gift, Smile } from 'lucide-react';

export const GlobalChat: React.FC = () => {
  const { user, globalChatMessages, addGlobalChatMessage, tipUser } = useGame();
  
  const [chatOpen, setChatOpen] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [tipTarget, setTipTarget] = useState<string | null>(null);
  const [tipAmt, setTipAmt] = useState('100');
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalChatMessages, chatOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    addGlobalChatMessage(inputVal.trim());
    setInputVal('');
    setShowEmoji(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputVal(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleSendTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipTarget) return;
    const amt = parseFloat(tipAmt);
    if (isNaN(amt) || amt <= 0) return;
    
    const success = tipUser(tipTarget, amt);
    if (success) {
      setTipTarget(null);
      setTipAmt('100');
    } else {
      alert('Insufficient practice balance to tip.');
    }
  };

  if (!chatOpen) {
    return (
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-24 right-4 z-30 p-3 bg-dark-900 border border-dark-750 text-neon-cyan hover:text-white rounded-full shadow-2xl transition-all hover:scale-105"
        title="Open Global Chat Room"
      >
        <MessageSquare size={20} />
      </button>
    );
  }

  const emojis = ['🔥', '🚀', '💎', '🍀', '🎰', '👀', '🤑', '🏆'];

  return (
    <aside className="w-80 border-l border-b-dark-700/60 bg-dark-950/45 backdrop-blur-md hidden xl:flex flex-col h-[calc(100vh-64px)] z-25 relative shrink-0">
      
      {/* Header */}
      <div className="p-4 border-b border-dark-750 flex items-center justify-between bg-dark-900/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-neon-cyan" size={16} />
          <h3 className="text-xs font-black text-white">Global Lobby Chat</h3>
        </div>
        <button
          onClick={() => setChatOpen(false)}
          className="p-1 text-gray-500 hover:text-white rounded hover:bg-dark-800"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {globalChatMessages.map((msg) => {
          const isSystem = msg.system;
          return (
            <div 
              key={msg.id}
              className={`p-2 rounded-xl text-[10px] border leading-relaxed animate-fade-in ${
                isSystem 
                  ? 'bg-neon-pink/5 border-neon-pink/20 text-white font-bold text-center'
                  : 'bg-dark-900/30 border-dark-800 text-gray-300'
              }`}
            >
              {!isSystem && (
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <span 
                      onClick={() => user && user.username !== msg.username && setTipTarget(msg.username)}
                      className="font-bold text-white hover:text-neon-cyan hover:underline cursor-pointer transition-colors"
                      title="Click to tip player"
                    >
                      {msg.username}
                    </span>
                    <span className={`inline-block px-1 rounded text-[7px] font-black uppercase ${
                      msg.vipTier === 'DIAMOND' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' :
                      msg.vipTier === 'PLATINUM' ? 'bg-purple-950 text-purple-400 border border-purple-500/20' :
                      msg.vipTier === 'GOLD' ? 'bg-amber-955 text-gold border border-gold/20' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {msg.vipTier}
                    </span>
                  </div>
                  <span className="text-[8px] text-gray-600 font-mono">{msg.time}</span>
                </div>
              )}
              <p className="text-gray-350">{msg.text}</p>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Tipping overlay modal */}
      {tipTarget && (
        <div className="absolute inset-0 bg-black/85 z-30 p-4 flex flex-col justify-center items-center">
          <form onSubmit={handleSendTip} className="glass-panel border border-neon-cyan/20 rounded-2xl p-5 w-full max-w-[240px] text-center space-y-4 animate-scale-up">
            <div className="h-10 w-10 bg-neon-cyan/10 border border-neon-cyan/35 text-neon-cyan rounded-full flex items-center justify-center mx-auto">
              <Gift size={20} />
            </div>
            
            <div>
              <h4 className="text-xs font-black text-white">Send Coin Tip</h4>
              <p className="text-[9px] text-gray-400">Transfer practice credits to <span className="text-neon-cyan font-bold">{tipTarget}</span></p>
            </div>

            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-gray-500 text-[10px] font-black">$</span>
              <input
                type="number"
                value={tipAmt}
                onChange={(e) => setTipAmt(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl py-1 pl-6 pr-3 text-xs text-white text-center font-bold"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipTarget(null)}
                className="flex-1 py-1.5 border border-dark-700 bg-dark-900 rounded-lg text-[10px] text-gray-400 font-bold hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black rounded-lg text-[10px] uppercase"
              >
                Tip coins
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-dark-750 bg-dark-900/20 space-y-2 relative">
        {showEmoji && (
          <div className="absolute bottom-14 left-3 bg-dark-900 border border-dark-750 p-2 rounded-xl flex gap-1.5 shadow-2xl animate-scale-up z-20">
            {emojis.map(e => (
              <button 
                key={e} 
                type="button" 
                onClick={() => handleSelectEmoji(e)}
                className="text-base hover:scale-110 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-800 rounded-lg"
          >
            <Smile size={16} />
          </button>
          
          <input
            type="text"
            placeholder={user ? "Type a message..." : "Sign in to chat"}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={!user}
            className="flex-1 bg-dark-950 border border-dark-750 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-neon-cyan disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!user || !inputVal.trim()}
            className="p-1.5 bg-neon-cyan disabled:bg-dark-800 text-black disabled:text-gray-500 rounded-xl transition-all"
          >
            <Send size={14} />
          </button>
        </div>
      </form>

    </aside>
  );
};
