import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'

const TEAL='#066A6F', NAVY='#102A43', PGREEN='#2FBF71'

export default function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { 
      const user = await login(form.email, form.password)
      navigate(user.role==='admin'?'/admin':'/dashboard') 
    }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const fillDemo = () => setForm({email:'admin@pto.com',password:'admin123'})

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="min-h-screen flex" style={{background:'#F9F5EF'}}>
      {/* Left panel: Admin Branding */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden" style={{background:`linear-gradient(150deg,${NAVY} 0%,#000 100%)`}}>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")"}}/>
        
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white">
             <ShieldCheck size={20} style={{color:NAVY}} />
          </div>
          <span className="font-display font-bold text-white text-xl">System Admin</span>
        </Link>
        <div className="relative z-10">
          <blockquote className="font-display text-3xl font-semibold text-white leading-tight mb-6">
            Administrator Gateway
          </blockquote>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-sky-900/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-teal-800/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-[440px] animate-fade-up bg-white p-8 sm:p-12 rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 relative z-10">
          <div className="lg:hidden mb-10 flex justify-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-linear-to-br from-navy-800 to-navy-950 border border-white/10" style={{background:NAVY}}>
                 <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight" style={{color:NAVY}}>System Admin</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl font-bold mb-3 tracking-tight bg-clip-text text-transparent bg-linear-to-r from-navy-900 to-navy-700">Admin Access</h1>
            <p className="mb-8 text-sm" style={{color:'#6B7280'}}>Sign in securely to manage the platform</p>
          </div>

          <div className="flex gap-2 mb-8">
            <button type="button" onClick={fillDemo} className="flex-1 text-xs py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-bold tracking-wide hover:bg-gray-100 hover:-translate-y-0.5 transition-all active:translate-y-0 shadow-sm">Demo Admin</button>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl text-sm mb-6 animate-pulse bg-red-50 border border-red-100 text-red-600 font-medium">
              <AlertCircle size={18} className="shrink-0"/>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Admin Email</label>
              <input type="email" required className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-navy-900/10 focus:border-navy-900 transition-all focus:bg-white" placeholder="admin@domain.com"
                value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Admin Password</label>
              <div className="relative">
                <input type={showPass?'text':'password'} required className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-navy-900/10 focus:border-navy-900 transition-all focus:bg-white" placeholder="••••••••"
                  value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
                <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-navy-900" style={{color:'#9CA3AF'}}>
                  {showPass?<EyeOff size={18}/>:<Eye size={18}/>}
                </button>
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full justify-center py-4 rounded-xl font-bold text-white shadow-lg lg:shadow-navy-900/20 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-60 disabled:hover:translate-y-0 flex items-center gap-2" style={{background: `linear-gradient(135deg, ${NAVY} 0%, #081622 100%)`}}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                ) : (
                  <>Authorize Admin <ArrowRight size={18}/></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
