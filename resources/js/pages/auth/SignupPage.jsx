import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Clock, Mail } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const TEAL='#066A6F', NAVY='#102A43', PGREEN='#2FBF71'
const programFeatures = [
  'Monthly credit score analytics',
  'Strategic coaching cards',
  'Curriculum attendance tracking',
  'Validated loan gateway access'
]

function PendingApprovalScreen({ name }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background:'#F9F5EF'}}>
      <div className="w-full max-w-[480px] bg-white p-10 rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 text-center space-y-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg" style={{background:`${TEAL}15`, border:`2px solid ${TEAL}30`}}>
          <Clock size={36} style={{color:TEAL}} />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-2" style={{color:NAVY}}>
            Account Submitted!
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Welcome, <span className="font-semibold" style={{color:NAVY}}>{name}</span>! Your registration is under review. An admin will verify and approve your account shortly.
          </p>
        </div>
        <div className="rounded-2xl p-5 text-left space-y-3" style={{background:`${TEAL}08`, border:`1px solid ${TEAL}20`}}>
          {[
            'Your account has been created with pending status.',
            'You will receive an email once your account is approved.',
            'After approval, you can log in to access your dashboard.',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle size={16} className="mt-0.5 shrink-0" style={{color:TEAL}} />
              <p className="text-xs text-gray-600 font-medium">{step}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium pt-2">
          <Mail size={14} />
          <span>Check your inbox for confirmation</span>
        </div>
        <Link to="/login" className="block w-full py-4 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 shadow-lg" style={{background:`linear-gradient(135deg, ${TEAL} 0%, #054e52 100%)`}}>
          Go to Login
        </Link>
      </div>
    </div>
  )
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [registeredName, setRegisteredName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (form.password!==form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length<6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try { 
      await signup(form.name, form.email, form.password)
      // If signup returns without throwing, user was auto-logged in (shouldn't happen with pending flow)
      navigate('/dashboard') 
    }
    catch (err) {
      const msg = err.message || ''
      // Detect the "pending approval" case — this is a SUCCESS not an error
      if (msg.toLowerCase().includes('pending') || msg.toLowerCase().includes('approval') || msg.toLowerCase().includes('verification')) {
        setRegisteredName(form.name)
        setIsPending(true)
      } else {
        setError(msg)
      }
    }
    finally { setLoading(false) }
  }

  if (isPending) return <PendingApprovalScreen name={registeredName} />

  return (
    <div className="min-h-screen flex" style={{background:'#F9F5EF'}}>
      {/* Left panel: Program Overview */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden" style={{background:NAVY}}>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{background:'rgba(6,106,111,0.15)'}}/>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{background:'rgba(244,176,0,0.08)'}}/>

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:TEAL}}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="10" cy="10" r="2.5" fill="#2FBF71"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white text-xl">MyScoreNova</span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-8">
            Strategic Path to<br/><span className="text-gradient-teal">Homeownership.</span>
          </h2>
          <div className="space-y-4">
            {programFeatures.map((p,i)=>(
              <div key={i} className="flex items-center gap-3">
                <CheckCircle size={18} style={{color:PGREEN}} className="shrink-0"/>
                <span className="text-sm" style={{color:'rgba(255,255,255,0.8)'}}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 rounded-2xl p-6" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
          <p className="text-sm font-display mb-4" style={{color:'rgba(255,255,255,0.75)'}}>
            "Registering for the program provided the structure necessary to meet lending requirements. My score delta was over 200 points within three quarters."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{background:TEAL,color:'white'}}>AJ</div>
            <div>
              <p className="text-white text-xs font-medium">Alex J.</p>
              <p className="text-xs" style={{color:'#4db2b2'}}>Program Graduate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        {/* Decorative blur elements */}
        <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-teal-400/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-[460px] animate-fade-up bg-white p-8 sm:p-12 rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 relative z-10">
          <div className="lg:hidden mb-10 flex justify-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-linear-to-br from-teal-600 to-navy-900 border border-white/10">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/></svg>
              </div>
              <span className="font-display font-bold text-xl tracking-tight" style={{color:NAVY}}>MyScoreNova</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl font-bold mb-3 tracking-tight bg-clip-text text-transparent bg-linear-to-r from-navy-900 to-navy-700">Registration</h1>
            <p className="mb-8 text-sm" style={{color:'#6B7280'}}>Establish your professional profile to begin the journey</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl text-sm mb-6 animate-pulse bg-red-50 border border-red-100 text-red-600 font-medium">
              <AlertCircle size={18} className="shrink-0"/>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
              <input type="text" required className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all focus:bg-white" placeholder="Full legal name"
                value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
              <input type="email" required className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all focus:bg-white" placeholder="email@address.com"
                value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Secure Password</label>
                <div className="relative">
                  <input type={showPass?'text':'password'} required className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all focus:bg-white" placeholder="Min 6 chars"
                    value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
                  <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-navy-900" style={{color:'#9CA3AF'}}>
                    {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Verify Password</label>
                <input type={showPass?'text':'password'} required className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all focus:bg-white" placeholder="Repeat password"
                  value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))}/>
              </div>
            </div>
            
            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full justify-center py-4 rounded-xl font-bold text-white shadow-lg shadow-teal-900/20 hover:shadow-xl hover:shadow-teal-900/30 transition-all hover:-translate-y-1 disabled:opacity-60 disabled:hover:translate-y-0 flex items-center gap-2" style={{background: `linear-gradient(135deg, ${TEAL} 0%, #054e52 100%)`}}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                ) : (
                  <>Initialize Account <ArrowRight size={18}/></>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm mt-8 font-medium text-gray-500">
            Existing participant?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 hover:underline underline-offset-4 transition-all pb-1">Sign in to portal</Link>
          </p>
        </div>
      </div>
    </div>
  )
}