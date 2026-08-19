import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, BookOpen, Key, LogOut, Menu, X, HelpCircle, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDialog } from '../../context/DialogContext'
import { motion, AnimatePresence } from 'framer-motion' // eslint-disable-line no-unused-vars

const TEAL='#066A6F', NAVY='#102A43'
const nav = [
  { to:'/dashboard',      icon:LayoutDashboard, label:'Watchtower' },
  { to:'/credit-score',   icon:TrendingUp,      label:'Credit Analysis' },
  { to:'/class-progress', icon:BookOpen,        label:'Learning Hub' },
  { to:'/loan-gateway',   icon:Key,             label:'Loan Gateway' },
  { to:'/quiz',           icon:HelpCircle,      label:'Assessments' },
  { to:'/profile',        icon:Settings,        label:'Preferences' },
]

function Logo() {
  return (
    <div className="flex items-center gap-3 mb-12 px-2">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3" style={{background: `linear-gradient(135deg, ${TEAL} 0%, #054e52 100%)`}}>
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
          <circle cx="10" cy="10" r="2.5" fill="#2FBF71"/><circle cx="10" cy="10" r="1" fill="white"/>
        </svg>
      </div>
      <div>
        <h2 className="font-display font-black text-lg tracking-tight leading-none" style={{color:NAVY}}>MyScoreNova</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50" style={{color:NAVY}}>Ecosystem</p>
      </div>
    </div>
  )
}

function Sidebar({ mobile, user, logout, setMobileOpen }) {
  const navigate = useNavigate()
  const { showDialog } = useDialog()
  
  const handleLogout = () => { 
    showDialog({
      title: 'Confirm Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmLabel: 'Sign Out',
      type: 'danger',
      onConfirm: () => {
        logout()
        navigate('/')
        if(setMobileOpen) setMobileOpen(false)
      }
    })
  }

  return (
    <aside className={`flex flex-col justify-between bg-white/70 backdrop-blur-xl border-r print:hidden transition-all duration-300 ${mobile?'w-72 h-full p-8':'w-72 min-h-screen p-8 hidden lg:flex'}`} style={{borderColor:'rgba(227, 230, 236, 0.5)', boxShadow: '20px 0 80px -20px rgba(16, 42, 67, 0.05)'}}>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Logo/>
        <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Principal</p>
        <nav className="space-y-1.5 font-sans">
          {nav.map(({to, icon: Icon, label}) => ( // eslint-disable-line no-unused-vars
            <NavLink key={to} to={to} onClick={()=>setMobileOpen && setMobileOpen(false)}
              className={({isActive}) => `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group ${isActive ? 'bg-linear-to-br from-navy-900 to-slate-900 text-white shadow-2xl shadow-navy-900/20 translate-x-1' : 'text-gray-500 hover:bg-gray-50/80 hover:text-navy-900 hover:translate-x-1'}`}
              style={({isActive}) => isActive ? { border: '1px solid rgba(255,255,255,0.1)' } : {}}>
              <Icon size={18} className="group-hover:scale-110 transition-transform"/>{label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-4 mb-6 p-4 rounded-3xl bg-gray-50/80 border border-gray-100 shadow-sm relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {user?.profile_picture ? (
            <img src={user?.profile_picture} alt={user?.name} className="w-10 h-10 rounded-2xl object-cover shadow-sm border-2 border-white relative z-10" />
          ) : (
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-md relative z-10" style={{background:TEAL}}>
              {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
          )}
          <div className="min-w-0 relative z-10">
            <p className="text-sm font-bold truncate" style={{color:NAVY}}>{user?.name}</p>
            <p className="text-[10px] font-medium truncate uppercase tracking-tighter opacity-50" style={{color:NAVY}}>Participant</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 group">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Sign out
        </button>
      </div>
    </aside>
  )
}

export default function ParticipantLayout() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-mesh">
      <Sidebar user={user} logout={logout} />
      
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between print:hidden" style={{borderColor:'rgba(227, 230, 236, 0.5)'}}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{background:TEAL}}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/></svg>
          </div>
          <span className="font-display font-black text-sm tracking-tight" style={{color:NAVY}}>MyScoreNova</span>
        </div>
        <button onClick={()=>setMobileOpen(s=>!s)} className="p-2.5 rounded-2xl bg-gray-50 text-navy-900 transition-all overflow-hidden relative active:scale-95 shadow-sm">
          {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="lg:hidden fixed inset-0 z-50 flex print:hidden shadow-2xl">
            <div className="absolute inset-0 bg-navy-900/20 backdrop-blur-sm" onClick={()=>setMobileOpen(false)}/>
            <motion.div initial={{x:-300}} animate={{x:0}} exit={{x:-300}} transition={{type:'spring', damping:25, stiffness:200}} className="relative z-10 h-full flex shadow-2xl">
              <Sidebar mobile user={user} logout={logout} setMobileOpen={setMobileOpen} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 lg:pt-0 pt-16 print:pt-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Outlet/>
        </div>
      </main>
    </div>
  )
}