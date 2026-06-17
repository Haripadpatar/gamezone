import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, Send, HelpCircle, PhoneCall, Check, ExternalLink } from 'lucide-react';

export const LiveChatSupport: React.FC = () => {
  const { faqItems, submitSupportTicket } = useGame();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket' | 'channels'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ticket fields
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('WALLET');
  const [message, setMessage] = useState('');
  const [ticketFeedback, setTicketFeedback] = useState('');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 z-40 p-4 bg-dark-900 border border-dark-750 text-neon-cyan hover:text-white rounded-full shadow-2xl transition-all hover:scale-105"
        title="24/7 Support Desk"
      >
        <PhoneCall size={20} />
      </button>
    );
  }

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    submitSupportTicket(subject, category, message);
    setSubject('');
    setMessage('');
    setTicketFeedback('Ticket registered! Our hosts will review it shortly.');
    setTimeout(() => setTicketFeedback(''), 4500);
  };

  // Filter FAQ items
  const filteredFaqs = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 rounded-2xl glass-panel-glow border border-dark-700 shadow-2xl overflow-hidden flex flex-col max-h-[500px] animate-scale-up">
      
      {/* Header */}
      <div className="p-4 border-b border-dark-750 flex justify-between items-center bg-dark-900/40">
        <div className="flex items-center gap-2">
          <PhoneCall size={16} className="text-neon-cyan" />
          <div>
            <h3 className="text-xs font-black text-white">Help & Support Desk</h3>
            <span className="text-[8px] text-gray-500 font-semibold">24/7 Player Concierge Service</span>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 text-gray-500 hover:text-white rounded-lg hover:bg-dark-800"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-750 bg-dark-900/20 text-[10px] font-bold text-gray-400">
        <button 
          onClick={() => { setActiveTab('faq'); setTicketFeedback(''); }}
          className={`flex-1 py-2 text-center border-b ${activeTab === 'faq' ? 'text-neon-cyan border-neon-cyan' : 'border-transparent'}`}
        >
          Search FAQs
        </button>
        <button 
          onClick={() => { setActiveTab('ticket'); setTicketFeedback(''); }}
          className={`flex-1 py-2 text-center border-b ${activeTab === 'ticket' ? 'text-neon-cyan border-neon-cyan' : 'border-transparent'}`}
        >
          Open Ticket
        </button>
        <button 
          onClick={() => { setActiveTab('channels'); setTicketFeedback(''); }}
          className={`flex-1 py-2 text-center border-b ${activeTab === 'channels' ? 'text-neon-cyan border-neon-cyan' : 'border-transparent'}`}
        >
          Direct Links
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[350px] bg-dark-950/20 text-xs">
        
        {/* FAQ Search Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search questions (e.g. withdraw)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-900 border border-dark-750 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-neon-cyan"
            />
            
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="text-center text-gray-550 italic py-6">
                  No FAQs matching your query. Check the Ticket tab.
                </div>
              ) : (
                filteredFaqs.map(faq => (
                  <div key={faq.id} className="p-3 bg-dark-900/40 border border-dark-800 rounded-xl space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <HelpCircle size={12} className="text-neon-cyan shrink-0" /> {faq.question}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-normal pl-4">{faq.answer}</p>
                    <span className="text-[8px] text-gray-650 block pl-4 uppercase font-bold tracking-wider">{faq.category}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Support Ticket Tab */}
        {activeTab === 'ticket' && (
          <form onSubmit={handleTicketSubmit} className="space-y-3">
            {ticketFeedback && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/20 text-neon-emerald rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1">
                <Check size={12} /> {ticketFeedback}
              </div>
            )}

            <div>
              <label className="block text-[10px] text-gray-500 mb-1 font-bold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl p-2 text-[10px] text-white focus:outline-none focus:border-neon-cyan font-bold"
              >
                <option value="WALLET">Wallet Deposits / Withdrawals</option>
                <option value="KYC">KYC & Identity checks</option>
                <option value="GAME">Game bugs / RTP inquiries</option>
                <option value="OTHER">Other problems</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 mb-1 font-bold">Subject Summary</label>
              <input
                type="text"
                placeholder="e.g. Deposit reference issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl p-2 text-[10px] text-white focus:outline-none focus:border-neon-cyan"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 mb-1 font-bold">Message Details</label>
              <textarea
                placeholder="Describe your issue with reference IDs if possible."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl p-2 text-[10px] text-white focus:outline-none focus:border-neon-cyan h-24 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black rounded-xl transition-colors text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg shadow-neon-cyan/15"
            >
              <Send size={10} /> Register Secure Ticket
            </button>
          </form>
        )}

        {/* Direct Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-4 pt-4">
            <p className="text-gray-400 leading-normal text-center max-w-xs mx-auto">
              For immediate priority help desks or partner inquiries, connect directly with our support teams via messaging networks:
            </p>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-sky-950/20 hover:bg-sky-950/40 border border-sky-500/20 rounded-xl flex items-center justify-between text-sky-400 font-bold transition-all hover:scale-[1.01]"
              >
                <span>Join Telegram Helpdesk Channel</span>
                <ExternalLink size={14} />
              </a>

              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/20 rounded-xl flex items-center justify-between text-neon-emerald font-bold transition-all hover:scale-[1.01]"
              >
                <span>Message WhatsApp Support Desk</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
