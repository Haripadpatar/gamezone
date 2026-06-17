import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, ArrowDownCircle, ArrowUpCircle, History, Check, ShieldAlert, CreditCard, Landmark, QrCode, Wallet, RefreshCw } from 'lucide-react';

export const WalletModal: React.FC = () => {
  const { 
    showWalletModal, 
    setShowWalletModal, 
    walletTab, 
    setWalletTab, 
    mainBalance,
    bonusBalance,
    lockedBalance,
    withdrawableBalance,
    practiceBalance,
    deposit, 
    withdraw, 
    cancelWithdrawal,
    transactions 
  } = useGame();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [routingCode, setRoutingCode] = useState('');
  
  // Verification states
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Transaction filtering tab
  const [txFilter, setTxFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'BONUS' | 'REFERRAL'>('ALL');

  if (!showWalletModal) return null;

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const depAmount = parseFloat(amount);
    if (isNaN(depAmount) || depAmount <= 0) {
      setErrorMsg('Please enter a valid deposit amount.');
      return;
    }
    if (depAmount < 10) {
      setErrorMsg('Minimum deposit amount is $10.');
      return;
    }

    setLoading(true);
    setVerificationStep('verifying');
    
    // Simulate auto-verification of reference codes
    setTimeout(async () => {
      try {
        await deposit(depAmount, method, reference);
        setVerificationStep('success');
        setSuccessMsg(`Deposit reference registered! Placed in pending queue for admin validation.`);
        setAmount('');
        setReference('');
      } catch {
        setErrorMsg('Failed to verify reference. Try again.');
        setVerificationStep('idle');
      } finally {
        setLoading(false);
      }
    }, 2500);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const wdAmount = parseFloat(amount);
    if (isNaN(wdAmount) || wdAmount <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      return;
    }
    if (wdAmount > withdrawableBalance) {
      setErrorMsg('Insufficient withdrawable funds.');
      return;
    }
    if (wdAmount < 50) {
      setErrorMsg('Minimum withdrawal threshold is $50.');
      return;
    }
    if (!bankName || !accountNum || !routingCode) {
      setErrorMsg('Please fill in bank account and routing codes.');
      return;
    }

    setLoading(true);
    try {
      await withdraw(wdAmount, method, `Bank: ${bankName}, Acc: ${accountNum}, Routing: ${routingCode}`);
      setSuccessMsg(`Withdrawal requested successfully. Pending verification.`);
      setAmount('');
      setBankName('');
      setAccountNum('');
      setRoutingCode('');
    } catch {
      setErrorMsg('Failed to request withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  // Filter transaction entries
  const filteredTxs = transactions.filter(tx => {
    if (txFilter === 'ALL') return true;
    return tx.type === txFilter;
  });

  const withdrawFee = amount ? parseFloat((parseFloat(amount) * 0.015).toFixed(2)) : 0.00;
  const netWithdraw = amount ? parseFloat((parseFloat(amount) - withdrawFee).toFixed(2)) : 0.00;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden glass-panel-glow rounded-2xl animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header decoration */}
        <div className="h-1.5 w-full bg-cyber-gradient" />

        {/* Close Button */}
        <button 
          onClick={() => { 
            setShowWalletModal(false); 
            setErrorMsg(''); 
            setSuccessMsg(''); 
            setVerificationStep('idle'); 
          }}
          className="absolute right-4 top-4 p-1 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        {/* Real Balance breakdown grids */}
        <div className="p-6 pb-2 border-b border-dark-700 bg-dark-900/40 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Wallet className="text-neon-cyan" size={18} /> AGX Account Wallet
              </h2>
              <p className="text-[10px] text-gray-450">Separate wallet ledger divisions</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-gray-500 uppercase font-bold">Practice Chips</span>
              <div className="text-sm font-extrabold text-neon-purple">${practiceBalance.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-dark-950 border border-dark-850 rounded-xl">
              <span className="text-[8px] text-gray-550 uppercase font-bold">Main Balance</span>
              <div className="text-sm font-black text-white mt-0.5">${mainBalance.toFixed(2)}</div>
            </div>
            <div className="p-2.5 bg-dark-950 border border-dark-850 rounded-xl">
              <span className="text-[8px] text-gray-550 uppercase font-bold">Bonus Credits</span>
              <div className="text-sm font-black text-neon-cyan mt-0.5">${bonusBalance.toFixed(2)}</div>
            </div>
            <div className="p-2.5 bg-dark-950 border border-dark-850 rounded-xl">
              <span className="text-[8px] text-gray-555 uppercase font-bold">Locked Wagers</span>
              <div className="text-sm font-black text-neon-pink mt-0.5">${lockedBalance.toFixed(2)}</div>
            </div>
            <div className="p-2.5 bg-dark-950 border border-dark-850 rounded-xl">
              <span className="text-[8px] text-gray-550 uppercase font-bold font-bold">Withdrawable</span>
              <div className="text-sm font-black text-neon-emerald mt-0.5">${withdrawableBalance.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex px-6 pt-3 bg-dark-900/20 border-b border-dark-700/50 text-xs">
          <button
            onClick={() => { setWalletTab('deposit'); setErrorMsg(''); setSuccessMsg(''); setVerificationStep('idle'); }}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative ${
              walletTab === 'deposit' ? 'text-neon-cyan' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ArrowDownCircle size={16} />
            Deposit Funds
            {walletTab === 'deposit' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan shadow-neon-cyan-glow" />
            )}
          </button>
          <button
            onClick={() => { setWalletTab('withdraw'); setErrorMsg(''); setSuccessMsg(''); setVerificationStep('idle'); }}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative ${
              walletTab === 'withdraw' ? 'text-neon-pink' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ArrowUpCircle size={16} />
            Withdraw Winnings
            {walletTab === 'withdraw' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-pink shadow-neon-pink-glow" />
            )}
          </button>
          <button
            onClick={() => { setWalletTab('history'); setErrorMsg(''); setSuccessMsg(''); setVerificationStep('idle'); }}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative ${
              walletTab === 'history' ? 'text-neon-purple' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <History size={16} />
            Ledger Sheets
            {walletTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple shadow-neon-purple-glow" />
            )}
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Status logs */}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-start gap-2">
              <Check size={16} className="shrink-0 mt-0.5 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. DEPOSIT PORTAL */}
          {walletTab === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              
              {verificationStep === 'verifying' ? (
                <div className="py-8 text-center space-y-4 animate-scale-up">
                  <RefreshCw className="h-10 w-10 text-neon-cyan animate-spin mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Verifying Transaction Reference...</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Checking with UPI/Card settlement queues</p>
                  </div>
                </div>
              ) : verificationStep === 'success' ? (
                <div className="py-8 text-center space-y-4 animate-scale-up">
                  <div className="h-12 w-12 bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald rounded-full flex items-center justify-center mx-auto shadow-neon-emerald">
                    <Check size={28} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-neon-emerald">Reference Code Registered</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Check pending approvals ledger. Wallet updates instantly on verify.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerificationStep('idle')}
                    className="py-1 px-4 bg-dark-900 border border-dark-750 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold"
                  >
                    Place Another Deposit
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5 font-bold">Deposit Channel</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'UPI', label: 'UPI / QR Code', icon: QrCode },
                        { id: 'CARD', label: 'Debit/Credit Cards', icon: CreditCard },
                        { id: 'CRYPTO', label: 'Crypto Assets', icon: Landmark }
                      ].map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMethod(item.id)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-[10px] font-bold ${
                            method === item.id 
                              ? 'border-neon-cyan bg-neon-cyan/5 text-white' 
                              : 'border-dark-700 bg-dark-900/40 text-gray-400 hover:text-gray-250 hover:border-gray-600'
                          }`}
                        >
                          <item.icon size={18} className={method === item.id ? 'text-neon-cyan' : 'text-gray-500'} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-550 mb-1.5 font-bold">Deposit Amount ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
                      <input
                        type="number"
                        placeholder="Enter amount (Min $10)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2.5 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-neon-cyan"
                        min={10}
                        required
                      />
                    </div>
                  </div>

                  {method === 'UPI' && (
                    <div className="p-4 bg-dark-900/40 border border-dark-800 rounded-xl flex flex-col items-center text-center space-y-3">
                      <div className="font-bold text-white text-[11px]">Scan UPI QR Code for instant routing</div>
                      {/* Simulated QR Code */}
                      <div className="p-2.5 bg-white rounded-xl border-4 border-dark-750 select-none">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=agxpay@ybl%26pn=AGX%26am=10" 
                          alt="UPI QR Code" 
                          className="h-28 w-28" 
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 leading-normal max-w-xs">
                        Transfer amount to UPI handle <span className="text-neon-cyan font-bold select-all">agxpay@ybl</span>, copy reference ID (UTR), and paste it below.
                      </div>
                    </div>
                  )}

                  {method === 'CRYPTO' && (
                    <div className="p-4 bg-dark-900/40 border border-dark-800 rounded-xl flex flex-col items-center text-center space-y-3">
                      <div className="font-bold text-white text-[11px]">Scan USDT-TRC20 Wallet QR</div>
                      <div className="p-2.5 bg-white rounded-xl border-4 border-dark-750 select-none">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=tAddress10495820" 
                          alt="Crypto Wallet QR" 
                          className="h-28 w-28" 
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 max-w-xs leading-normal">
                        USDT Address: <span className="text-neon-cyan font-bold select-all text-[8px] break-all block">TTRC20agX1049582049582049582049</span>
                        Transfer funds and enter TXID reference below.
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] text-gray-550 mb-1.5 font-bold">Transaction Reference ID (UTR / TXID)</label>
                    <input
                      type="text"
                      placeholder="Enter 12-digit number / transaction hash"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-neon-cyan"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-neon-cyan hover:bg-neon-cyan/85 text-black font-black text-xs rounded-xl transition-all shadow-lg shadow-neon-cyan/15 uppercase tracking-wider"
                  >
                    Submit Deposit Ticket
                  </button>
                </>
              )}
            </form>
          )}

          {/* 2. WITHDRAWAL PORTAL */}
          {walletTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5 font-bold">Withdrawal Destination</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'BANK', label: 'Direct Bank Wire', icon: Landmark },
                    { id: 'UPI', label: 'UPI Wallet address', icon: QrCode }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-[10px] font-bold ${
                        method === item.id 
                          ? 'border-neon-pink bg-neon-pink/5 text-white' 
                          : 'border-dark-700 bg-dark-900/40 text-gray-450 hover:text-gray-250'
                      }`}
                    >
                      <item.icon size={18} className={method === item.id ? 'text-neon-pink' : 'text-gray-550'} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-550 mb-1.5 font-bold">Withdrawal Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    placeholder="Enter amount (Min $50)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-750 rounded-xl py-2.5 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-neon-pink"
                    min={50}
                    max={withdrawableBalance}
                    required
                  />
                </div>
                
                <div className="flex justify-between items-center mt-1.5 text-[9px] text-gray-500 font-bold">
                  <span>Available Withdrawable: ${withdrawableBalance.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => setAmount(Math.max(50, Math.floor(withdrawableBalance)).toString())}
                    className="text-neon-pink hover:underline"
                  >
                    Withdraw Max Limit
                  </button>
                </div>
              </div>

              {method === 'BANK' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] text-gray-500 mb-1 font-bold">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. JPMorgan Chase"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-gray-500 mb-1 font-bold">Account Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 10492850"
                        value={accountNum}
                        onChange={(e) => setAccountNum(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-500 mb-1 font-bold">Routing / IFSC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. RTN10492"
                        value={routingCode}
                        onChange={(e) => setRoutingCode(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[9px] text-gray-550 mb-1 font-bold">UPI ID Address</label>
                  <input
                    type="text"
                    placeholder="e.g. username@upi"
                    value={accountNum}
                    onChange={(e) => {
                      setAccountNum(e.target.value);
                      setBankName('UPI');
                      setRoutingCode('UPI_DIRECT');
                    }}
                    className="w-full bg-dark-900 border border-dark-750 rounded-lg p-2 text-[10px] text-white focus:outline-none"
                    required
                  />
                </div>
              )}

              {/* Fee and limit summaries */}
              <div className="p-3 bg-dark-900 border border-dark-750 rounded-xl space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Processing Fee (1.5%)</span>
                  <span className="text-neon-pink font-semibold">${withdrawFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-white border-t border-dark-750 pt-1.5">
                  <span>Net Expected Disbursal</span>
                  <span className="text-neon-emerald">${netWithdraw.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 pt-0.5 font-bold">
                  <span>Expected Disbursal Time</span>
                  <span>Instant to 2 hours</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-neon-pink hover:bg-neon-pink/85 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-neon-pink/15 uppercase tracking-wider"
              >
                Request Secure Disbursal
              </button>
            </form>
          )}

          {/* 3. TRANSACTION HISTORY */}
          {walletTab === 'history' && (
            <div className="space-y-4">
              
              {/* Filter Tabs */}
              <div className="flex gap-1 bg-dark-900 border border-dark-750 p-0.5 rounded-lg text-[9px] font-bold overflow-x-auto max-w-full">
                {[
                  { id: 'ALL', label: 'All Txs' },
                  { id: 'DEPOSIT', label: 'Deposits' },
                  { id: 'WITHDRAWAL', label: 'Withdraws' },
                  { id: 'BONUS', label: 'Bonuses' },
                  { id: 'REFERRAL', label: 'Referrals' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTxFilter(tab.id as any)}
                    className={`px-2 py-1 rounded transition-colors shrink-0 ${
                      txFilter === tab.id 
                        ? 'bg-dark-750 text-white font-extrabold shadow' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Transactions list */}
              {filteredTxs.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-[10px] italic">
                  No matching transaction history log.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTxs.map(tx => (
                    <div key={tx.id} className="p-3 bg-dark-900/60 border border-dark-800 rounded-xl flex justify-between items-center text-[10px]">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black uppercase text-[9px] ${
                            tx.type === 'DEPOSIT' ? 'text-neon-cyan' : tx.type === 'WITHDRAWAL' ? 'text-neon-pink' : 'text-neon-purple'
                          }`}>{tx.type}</span>
                          <span className="text-[8px] text-gray-550">({tx.paymentMethod})</span>
                        </div>
                        <div className="text-[9px] text-gray-500 mt-1 select-all font-mono">Ref ID: {tx.reference}</div>
                        <span className="text-[8px] text-gray-650 mt-0.5 block">{tx.date}</span>
                      </div>
                      
                      <div className="text-right space-y-1 shrink-0">
                        <div className={`font-black text-xs ${
                          tx.type === 'DEPOSIT' || tx.type === 'BONUS' || tx.type === 'REFERRAL' ? 'text-neon-emerald' : 'text-neon-pink'
                        }`}>
                          {tx.type === 'DEPOSIT' || tx.type === 'BONUS' || tx.type === 'REFERRAL' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                            tx.status === 'SUCCESS' ? 'bg-emerald-950/40 text-neon-emerald border border-emerald-500/10' :
                            tx.status === 'PENDING' ? 'bg-amber-955/40 text-amber-400 border border-amber-500/10' :
                            'bg-red-950/20 text-neon-pink border border-red-500/10'
                          }`}>
                            {tx.status}
                          </span>
                          
                          {/* Cancel withdrawal action */}
                          {tx.type === 'WITHDRAWAL' && tx.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => cancelWithdrawal(tx.id)}
                              className="px-1.5 py-0.5 bg-dark-800 hover:bg-red-950 text-gray-400 hover:text-neon-pink border border-dark-750 hover:border-neon-pink/20 rounded text-[8px] font-bold transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
