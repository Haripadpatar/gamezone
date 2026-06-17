import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, Lock, Mail, User as UserIcon, Award, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, authTab, setAuthTab, login, register } = useGame();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [refBy, setRefBy] = useState('');
  const [step2FA, setStep2FA] = useState(false);
  const [code2FA, setCode2FA] = useState('');
  const [error, setError] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || (authTab === 'register' && !email)) {
      setError('Please fill in all required fields.');
      return;
    }

    // Enter Mock 2FA step to make the authentication feel professional
    setStep2FA(true);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code2FA !== '123456' && code2FA !== '1234') {
      setError('Invalid 2FA code. Use bypass code "1234" or "123456".');
      return;
    }

    if (authTab === 'login') {
      login(username, email || `${username}@antigravity.io`);
    } else {
      register(username, email, refBy);
    }

    // Reset fields
    setUsername('');
    setEmail('');
    setPassword('');
    setRefBy('');
    setCode2FA('');
    setStep2FA(false);
    setShowAuthModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden glass-panel-glow rounded-2xl animate-fade-in">
        
        {/* Header decoration */}
        <div className="h-1.5 w-full bg-cyber-gradient" />

        {/* Close button */}
        <button 
          onClick={() => { setShowAuthModal(false); setStep2FA(false); setError(''); }}
          className="absolute right-4 top-4 p-1 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {!step2FA ? (
            <>
              {/* Header tabs */}
              <div className="flex border-b border-dark-700 mb-6">
                <button
                  onClick={() => { setAuthTab('login'); setError(''); }}
                  className={`flex-1 pb-3 text-center font-semibold text-sm transition-colors relative ${
                    authTab === 'login' ? 'text-neon-cyan' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Sign In
                  {authTab === 'login' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan shadow-neon-cyan-glow" />
                  )}
                </button>
                <button
                  onClick={() => { setAuthTab('register'); setError(''); }}
                  className={`flex-1 pb-3 text-center font-semibold text-sm transition-colors relative ${
                    authTab === 'register' ? 'text-neon-purple' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Join Now
                  {authTab === 'register' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple shadow-neon-purple-glow" />
                  )}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-400 rounded-lg text-xs">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input
                      type="text"
                      placeholder="Enter username (use 'admin' for dashboard)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {authTab === 'register' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-gray-500" size={16} />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/30 transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/30 transition-all"
                      required
                    />
                  </div>
                </div>

                {authTab === 'register' && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Referral Code (Optional)</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-2.5 text-gray-500" size={16} />
                      <input
                        type="text"
                        placeholder="Enter partner referral code"
                        value={refBy}
                        onChange={(e) => setRefBy(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/30 transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-2.5 mt-2 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${
                    authTab === 'login'
                      ? 'bg-neon-cyan hover:bg-neon-cyan/80 shadow-neon-cyan/20'
                      : 'bg-neon-purple hover:bg-neon-purple/80 shadow-neon-purple/20'
                  }`}
                >
                  {authTab === 'login' ? 'Sign In Securely' : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            /* 2FA STEP */
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="text-center py-4">
                <div className="inline-flex p-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full mb-3 text-neon-cyan">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Two-Factor Authentication</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  To protect your wallet, enter the security code. (Use code <span className="text-neon-cyan font-bold">1234</span> for mock bypass).
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-400 rounded-lg text-xs text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium text-center">Verification Code</label>
                <input
                  type="text"
                  placeholder="Enter 4 or 6 digit code"
                  value={code2FA}
                  onChange={(e) => setCode2FA(e.target.value)}
                  className="w-full text-center bg-dark-900 border border-dark-700 rounded-xl py-3 text-lg font-bold tracking-widest text-white focus:outline-none focus:border-neon-cyan transition-all"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep2FA(false)}
                  className="flex-1 py-2.5 bg-dark-700 hover:bg-dark-600 rounded-xl text-sm font-semibold text-white transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neon-cyan hover:bg-neon-cyan/80 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-neon-cyan/20"
                >
                  Verify Wallet
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
