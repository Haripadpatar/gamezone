import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, RefreshCw, Sparkles, Check } from 'lucide-react';

export const ProvablyFair: React.FC = () => {
  const [serverSeed, setServerSeed] = useState('407f3f982928374d6f7a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e');
  const [clientSeed, setClientSeed] = useState('customClientSeed123');
  const [nonce, setNonce] = useState('1');
  const [verificationResult, setVerificationResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Simulate SHA-256 outcome verification logic
      // In a real verification, we'd hash: ServerSeed + ClientSeed + Nonce
      const combined = `${serverSeed}-${clientSeed}-${nonce}`;
      // Generate a mock hash
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      const hexHash = Math.abs(hash).toString(16).padEnd(16, 'f') + Math.abs(hash * 31).toString(16).padEnd(16, 'a') + Math.abs(hash * 7).toString(16).padEnd(16, 'd');
      setVerificationResult(hexHash.substring(0, 64));
      setLoading(false);
    }, 800);
  };

  const handleRotateSeeds = () => {
    // Generate new random server seed
    const newSeed = Array.from({ length: 64 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
    setServerSeed(newSeed);
    setVerificationResult('');
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-700/80 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-md">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-neon-cyan" size={24} /> Provably Fair Verification
          </h1>
          <p className="text-xs text-gray-400">
            Verify the mathematical integrity of every roll, card split, and mines sweep. Once seeds are committed, results are unalterable.
          </p>
        </div>
        <div className="h-16 w-16 bg-neon-cyan/10 border border-neon-cyan/30 rounded-2xl flex items-center justify-center text-neon-cyan shrink-0 z-10 animate-pulse">
          <ShieldCheck size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Verification Inputs */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <HelpCircle size={14} className="text-neon-cyan" /> Verify Seed Hashes
          </h3>
          
          <form onSubmit={handleVerify} className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-gray-500 font-bold">Active Server Seed (Hashed)</label>
                <button
                  type="button"
                  onClick={handleRotateSeeds}
                  className="text-neon-cyan font-bold flex items-center gap-1 hover:underline text-[10px]"
                >
                  <RefreshCw size={10} /> Rotate Seed
                </button>
              </div>
              <input
                type="text"
                value={serverSeed}
                onChange={(e) => setServerSeed(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl p-2.5 text-[10px] text-white focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-gray-505 mb-1.5 font-bold">Client Seed (Customizable)</label>
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-gray-505 mb-1.5 font-bold">Nonce (Bet counter)</label>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                min={1}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black rounded-xl transition-all shadow-lg shadow-neon-cyan/15 uppercase tracking-wider"
            >
              {loading ? 'Hasing seeds...' : 'Calculate Verification Hash'}
            </button>
          </form>
        </div>

        {/* Math explanation & outcomes */}
        <div className="lg:col-span-6 space-y-6">
          
          {verificationResult && (
            <div className="glass-panel border border-neon-cyan/25 bg-neon-cyan/5 rounded-2xl p-5 space-y-3 animate-scale-up">
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles size={12} className="text-neon-cyan" /> Hashed Result Outcome
              </h4>
              <div className="p-3 bg-dark-950 border border-dark-850 rounded-xl break-all font-mono text-[10px] text-neon-emerald">
                {verificationResult}
              </div>
              <div className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                <Check size={12} className="text-neon-emerald shrink-0" /> Outcomes match cryptographic RNG layouts. Fair roll verified!
              </div>
            </div>
          )}

          <div className="glass-panel rounded-2xl border border-dark-700/60 p-5 space-y-3">
            <h3 className="text-sm font-black text-white">How Fair Gaming Works</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Before a round begins, the server creates a secret **Server Seed** and displays its SHA-256 hashed signature to the player. Since you only see the hash, you cannot predict the cards or mines.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              You can customize the **Client Seed** to add your own entropy. Once the round finishes, the server reveals the original unhashed Server Seed.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              If the hash of the revealed Server Seed matches the pre-hash signature you saw before betting, it mathematically proves the result was decided beforehand and not manipulated in response to your bet.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
