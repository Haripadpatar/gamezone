import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, Shield, Mail, Phone, UploadCloud, CheckCircle2, History, ToggleLeft, ToggleRight, KeyRound } from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const { showProfileModal, setShowProfileModal, user, updateUserProfile, verifyKyc } = useGame();
  
  const [docType, setDocType] = useState('ID_CARD');
  const [idNumber, setIdNumber] = useState('');
  const [phoneVal, setPhoneVal] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!showProfileModal || !user) return null;

  const handleRandomizeAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    updateUserProfile({ avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${newSeed}` });
  };

  const handleVerifyPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneVal) return;
    setVerifyingPhone(true);
    setTimeout(() => {
      setVerifyingPhone(false);
      updateUserProfile({ phoneVerified: true });
      setPhoneVal('');
      setFeedback('Phone verified successfully!');
      setTimeout(() => setFeedback(''), 4000);
    }, 1500);
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber) return;
    verifyKyc(docType, idNumber);
    setIdNumber('');
    setFeedback('KYC Documents Uploaded! Pending review.');
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden glass-panel-glow rounded-2xl animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header decoration */}
        <div className="h-1.5 w-full bg-cyber-gradient" />

        {/* Close Button */}
        <button 
          onClick={() => { setShowProfileModal(false); setFeedback(''); }}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="p-6 pb-2 border-b border-dark-700 flex items-center gap-3">
          <div className="p-2 bg-neon-cyan/15 border border-neon-cyan/20 text-neon-cyan rounded-xl">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-white">UserProfile Center</h2>
            <p className="text-[10px] text-gray-400">Moderate account credentials, KYC details, and verification settings</p>
          </div>
        </div>

        {/* Inner layout splits */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left split: avatar card & verifications */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Avatar customization */}
            <div className="p-4 bg-dark-900/60 border border-dark-750 rounded-xl text-center space-y-3">
              <div className="relative inline-block mx-auto">
                <img 
                  src={user.avatarUrl} 
                  alt="Avatar" 
                  className="h-20 w-20 rounded-2xl bg-dark-950 border border-dark-700 mx-auto" 
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white truncate">{user.username}</h3>
                <span className="text-[9px] text-gray-550">Joined {user.joinedAt}</span>
              </div>
              <button
                onClick={handleRandomizeAvatar}
                className="py-1 px-3 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold transition-all w-full"
              >
                Randomize Avatar
              </button>
            </div>

            {/* Verification Checkpoints */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Account Checks</h4>
              
              <div className="space-y-2">
                {/* Email */}
                <div className="p-3 bg-dark-900/40 border border-dark-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-500" />
                    <span className="text-gray-300 truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <span className="text-[9px] font-black text-neon-emerald flex items-center gap-0.5 uppercase">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                </div>

                {/* Phone */}
                <div className="p-3 bg-dark-900/40 border border-dark-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-500" />
                      <span className="text-gray-300">Phone Verification</span>
                    </div>
                    {user.phoneVerified ? (
                      <span className="text-[9px] font-black text-neon-emerald flex items-center gap-0.5 uppercase">
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-neon-pink uppercase">Unverified</span>
                    )}
                  </div>

                  {!user.phoneVerified && (
                    <form onSubmit={handleVerifyPhoneSubmit} className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Enter mobile number"
                        value={phoneVal}
                        onChange={(e) => setPhoneVal(e.target.value)}
                        className="flex-1 bg-dark-950 border border-dark-750 rounded-lg py-1 px-2.5 text-[10px] text-white focus:outline-none focus:border-neon-cyan"
                        required
                      />
                      <button
                        type="submit"
                        disabled={verifyingPhone}
                        className="px-2.5 py-1 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black text-[9px] rounded-lg transition-colors"
                      >
                        {verifyingPhone ? '...' : 'Verify'}
                      </button>
                    </form>
                  )}
                </div>

                {/* KYC status */}
                <div className="p-3 bg-dark-900/40 border border-dark-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-gray-300">KYC Status Check</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    user.kycStatus === 'VERIFIED' ? 'bg-emerald-950 text-neon-emerald border border-emerald-500/20' :
                    user.kycStatus === 'PENDING' ? 'bg-amber-950 text-amber-400 border border-amber-500/20' :
                    'bg-red-950 text-neon-pink border border-red-500/20'
                  }`}>
                    {user.kycStatus}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Right split: KYC portal, Security settings, Logs */}
          <div className="md:col-span-7 space-y-6">
            
            {feedback && (
              <div className="p-3 bg-emerald-950/45 border border-emerald-500/25 text-neon-emerald rounded-xl text-[10px] font-bold text-center">
                {feedback}
              </div>
            )}

            {/* KYC Upload */}
            {user.kycStatus === 'UNVERIFIED' && (
              <div className="p-4 bg-dark-900/30 border border-dark-800 rounded-xl space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                  <UploadCloud size={12} /> Document Verification Portal
                </h4>
                
                <form onSubmit={handleKycSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Doc Type</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-neon-cyan"
                      >
                        <option value="ID_CARD">National ID Card</option>
                        <option value="PASSPORT">Passport</option>
                        <option value="DRIVING_LICENSE">Driving License</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Document number</label>
                      <input
                        type="text"
                        placeholder="e.g. D104958"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-neon-cyan"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-2 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black rounded-lg transition-colors text-[10px] uppercase tracking-wider"
                  >
                    Submit Files for Verification
                  </button>
                </form>
              </div>
            )}

            {/* Security Config */}
            <div className="p-4 bg-dark-900/30 border border-dark-800 rounded-xl space-y-3">
              <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                <KeyRound size={12} /> Account Security
              </h4>
              
              <div className="flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white">Enable Two-Factor Authentication</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Prompt wallet code on logins or withdrawal claims</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateUserProfile({ security2Fa: !user.security2Fa })}
                  className="text-gray-400 hover:text-white"
                >
                  {user.security2Fa ? (
                    <ToggleRight className="text-neon-cyan" size={28} />
                  ) : (
                    <ToggleLeft size={28} />
                  )}
                </button>
              </div>
            </div>

            {/* Login History logs */}
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                <History size={12} /> Recent Login History
              </h4>
              
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {user.loginHistory.map((log, idx) => (
                  <div key={idx} className="p-2 bg-dark-900/60 border border-dark-800/40 rounded-lg flex justify-between items-center text-[9px]">
                    <div>
                      <div className="font-semibold text-gray-300">{log.device} • {log.ip}</div>
                      <span className="text-gray-550">{log.location}</span>
                    </div>
                    <span className="text-gray-600 font-mono">{log.date}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
