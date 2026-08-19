import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Unlock, Phone, ShieldCheck, Zap, UserCheck, BarChart3, ArrowRight, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react'
import { useAuth, getStatusFromScore } from '../../context/AuthContext'
import { useDialog } from '../../context/DialogContext'
import { motion } from 'framer-motion'

// Color Constants
const NAVY = '#102A43', PGREEN = '#2FBF71', GOLD = '#F4B000', TEAL = '#066A6F'

const loanOfficers = [
  { name: 'Tina Patton', title: 'Senior Loan Officer', specialty: 'FHA & First-time buyers', initials: 'TP', available: true, phone: '+1 (574) 876-2106' },
]

const loanTypes = [
  { name: 'FHA Loan',       minScore: 580, downPct: '3.5%', best: 'First-time buyers' },
  { name: 'Conventional',   minScore: 620, downPct: '3–20%', best: 'Strong credit' },
  { name: 'USDA Loan',      minScore: 640, downPct: '0%',    best: 'Rural properties' },
  { name: 'VA Loan',        minScore: 580, downPct: '0%',    best: 'Veterans / military' },
]

export default function LoanGatewayPage() {
  const { user, api } = useAuth()
  const { showDialog } = useDialog()
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const handleInquiry = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      await api.post('/messages', { message })
      setSubmitted(true)
      setMessage('')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const history = user?.creditHistory || []
  const latest = history[history.length - 1]
  const status = latest ? getStatusFromScore(latest.score) : null
  const isUnlocked = status?.color === 'green'
  const pointsNeeded = latest ? Math.max(0, 670 - latest.score) : 670
  const pct = latest ? Math.round(((latest.score - 300) / 550) * 100) : 0

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}} className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ background: NAVY }}>
              <ShieldCheck size={22} />
            </div>
            <h1 className="font-display text-3xl font-bold italic uppercase tracking-tight" style={{ color: NAVY }}>Loan Gateway</h1>
          </div>
          <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Secure mortgage pathways for verified program participants.</p>
        </div>
        <div className="flex items-center gap-4 px-5 py-2.5 rounded-xl border" style={{ background: '#FAFAFA', borderColor: '#E3E6EC' }}>
          <BarChart3 style={{ color: NAVY }} size={18} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>Lender Market</p>
            <p className="text-xs font-bold uppercase tracking-tighter" style={{ color: NAVY }}>Live Integration Active</p>
          </div>
        </div>
      </div>

      {/* Hero: Gateway Status */}
      <div className="card overflow-hidden border-none shadow-xl" style={{ background: isUnlocked ? 'white' : NAVY }}>
        <div className="grid lg:grid-cols-12 items-center">
          {/* Visual Lock/Unlock Indicator */}
          <div className={`lg:col-span-4 p-12 flex flex-col items-center justify-center text-center ${isUnlocked ? 'bg-emerald-50/50' : 'bg-white/5'}`}>
            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-700 ${isUnlocked ? 'text-white' : 'text-amber-400 font-black italic'}`} 
                   style={{ background: isUnlocked ? PGREEN : 'transparent', border: isUnlocked ? 'none' : `2px dashed ${GOLD}` }}>
              {isUnlocked ? <Unlock size={48} /> : <Lock size={48} />}
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: isUnlocked ? PGREEN : GOLD }}>System Status</p>
              <h3 className={`font-display text-xl font-bold italic ${isUnlocked ? '' : 'text-white'}`}>
                {isUnlocked ? 'Access Validated' : 'Access Restricted'}
              </h3>
            </div>
          </div>

          {/* Status Details */}
          <div className="lg:col-span-8 p-10 lg:p-14">
            {isUnlocked ? (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block text-white" style={{ background: PGREEN }}>Security Clearance: High</span>
                <h2 className="font-display text-4xl font-bold mb-4 italic tracking-tight" style={{ color: NAVY }}>Access Granted.</h2>
                <p className="text-sm font-medium leading-relaxed max-w-md mb-8" style={{ color: '#6B7280' }}>
                  Your score of <span className="font-bold underline" style={{ color: PGREEN }}>{latest?.score}</span> has met the primary lender threshold. Senior loan officers are now available for direct consultation.
                </p>
                <button 
                  onClick={() => showDialog({ 
                    title: 'System Protocol', 
                    message: 'Initiating secure pre-approval sequence. Our underwriters will review your verified position.', 
                    type: 'confirm',
                    confirmLabel: 'Proceed'
                  })} 
                  className="btn-primary px-8! py-3! flex items-center gap-3 shadow-lg" 
                  style={{ background: TEAL }}
                >
                  <UserCheck size={18} /> <span className="uppercase tracking-widest font-bold text-xs">Begin Pre-Approval</span>
                </button>
              </div>
            ) : (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block text-white" style={{ background: GOLD }}>Phase 01: Qualification</span>
                <h2 className="font-display text-4xl font-bold mb-4 italic text-white">Elevate Your Position.</h2>
                <p className="text-sm font-medium leading-relaxed max-w-md mb-6 text-white/60">
                   The gateway unlocks at <span className="text-white font-bold underline">670 points</span>. You are <span className="font-bold" style={{ color: GOLD }}>{pointsNeeded} pts</span> away from direct lender access.
                </p>
                <div className="space-y-3 max-w-sm mb-8">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-1000" style={{ width: `${Math.min(pct, 100)}%`, background: GOLD }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-white/40">
                    <span>Current: {latest?.score || 300}</span>
                    <span>Target: 670</span>
                  </div>
                </div>
                <Link to="/credit-score" className="btn-primary bg-white! text-navy-900! inline-flex items-center gap-3 hover:scale-105 transition-transform" style={{ color: NAVY }}>
                  <TrendingUp size={18} /> <span className="uppercase tracking-widest font-bold text-xs">Boost Score Now</span> <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isUnlocked && (
        <div className="space-y-10">
          {/* Partner Grid */}
          <div>
            <div className="flex items-center gap-3 mb-6">
               <Zap size={24} style={{ color: GOLD }} fill={GOLD} />
               <h2 className="font-display text-2xl font-bold italic" style={{ color: NAVY }}>Preferred Lending Partner</h2>
            </div>
            <div className="flex justify-start">
              {loanOfficers.map((officer, i) => (
                <div key={i} className={`card p-6 border-brand-light-gray transition-all hover:shadow-lg max-w-md w-full`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold text-lg" style={{ background: NAVY }}>
                      {officer.initials}
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border px-2 py-0.5 rounded">LVL 4 Officer</span>
                  </div>
                  <h4 className="font-display text-lg font-bold italic uppercase tracking-tighter" style={{ color: NAVY }}>{officer.name}</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{officer.title}</p>
                  <p className="text-xs font-bold mb-4" style={{ color: TEAL }}>{officer.phone}</p>
                  <div className="bg-gray-50 rounded-xl p-3 mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: TEAL }}>Specialty</p>
                    <p className="text-xs font-bold" style={{ color: NAVY }}>{officer.specialty}</p>
                  </div>
                  <button onClick={() => showDialog({ title: 'Secure Call', message: `Secured Call initiated with ${officer.name}. Please stay by your phone.`, type: 'alert' })} className="btn-primary w-full py-3! flex justify-center items-center gap-2" style={{ background: TEAL }}>
                    <Phone size={14} strokeWidth={3} /> <span className="uppercase tracking-widest font-bold text-[10px]">Secure Call</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pathways Table */}
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold italic" style={{ color: NAVY }}>Eligible Pathways</h2>
            <div className="card overflow-hidden border shadow-sm" style={{ borderColor: '#E3E6EC' }}>
              <div className="grid grid-cols-4 p-4 text-[10px] font-bold uppercase tracking-widest border-b" style={{ background: '#FAFAFA', color: '#6B7280' }}>
                <span>Program</span><span>Min. Score</span><span>Down Pmt</span><span>Strategic Profile</span>
              </div>
              {loanTypes.map((loan, i) => (
                <div key={i} className="grid grid-cols-4 p-5 items-center border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                  <span className="font-display font-bold italic tracking-tighter uppercase" style={{ color: NAVY }}>{loan.name}</span>
                  <span className="font-mono text-sm font-bold">{loan.minScore}</span>
                  <span className="text-xs font-bold" style={{ color: PGREEN }}>{loan.downPct}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{loan.best}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Concierge */}
          <div className="card p-10 text-white relative overflow-hidden" style={{ background: NAVY }}>
             <MessageSquare className="absolute -bottom-10 -right-10 text-white/5" size={240} />
             <div className="max-w-xl relative z-10">
                <h3 className="font-display text-3xl font-bold mb-3 italic tracking-tighter uppercase">Direct Concierge</h3>
                {submitted ? (
                  <div className="py-6 px-4 bg-white/10 rounded-xl border border-teal-500/30 flex items-center gap-4">
                    <CheckCircle className="text-teal-400" size={32} />
                    <div>
                      <p className="font-bold text-lg text-teal-400">Inquiry Received</p>
                      <p className="text-sm text-white/70">A partner will contact you shortly.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-white/60 mb-6 font-medium">Have a specific question about loan? Submit an inquiry directly to our partner queue.</p>
                    <div className="space-y-4">
                        <textarea 
                         value={message} 
                         onChange={e=>setMessage(e.target.value)} 
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-teal-400 transition-colors" 
                         rows={3} 
                         placeholder="Message..." 
                       />
                       <button onClick={handleInquiry} disabled={!message || loading} className="px-10 py-3 rounded-lg font-bold uppercase tracking-widest text-xs shadow-xl transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]" style={{ background: PGREEN }}>
                          {loading ? <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" /> : 'Submit Case'}
                       </button>
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Benchmarks for locked users */}
      {!isUnlocked && (
        <div className="pt-8">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-xl font-bold italic" style={{ color: NAVY }}>Market Benchmarks</h2>
          </div>
          <div className="card overflow-hidden border shadow-sm">
            <div className="grid grid-cols-4 p-4 text-[10px] font-bold uppercase tracking-widest" style={{ background: '#FAFAFA', color: '#6B7280' }}>
              <span>Program</span><span>Req. Score</span><span>Down Pmt</span><span>Target Group</span>
            </div>
            {loanTypes.map((loan, i) => {
              const eligible = latest && latest.score >= loan.minScore;
              return (
                <div key={i} className={`grid grid-cols-4 p-5 items-center border-b last:border-0 ${eligible ? 'bg-emerald-50/30' : 'opacity-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold italic uppercase text-sm" style={{ color: NAVY }}>{loan.name}</span>
                    {eligible && <span className="text-[8px] px-1.5 py-0.5 rounded-full text-white font-bold uppercase" style={{ background: PGREEN }}>Eligible</span>}
                  </div>
                  <span className="font-mono text-xs font-bold">{loan.minScore}</span>
                  <span className="text-xs font-bold" style={{ color: PGREEN }}>{loan.downPct}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{loan.best}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}