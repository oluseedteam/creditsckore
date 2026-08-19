import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Shield, Menu, X, FileText, BarChart3, Users, MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDialog } from '../../context/DialogContext'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TEAL='#066A6F', NAVY='#0F172A', PGREEN='#10B981'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { showDialog } = useDialog()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const handleLogout = () => { 
    showDialog({
      title: 'Authorize Logout',
      message: 'Securely terminate your administrative session?',
      confirmLabel: 'Terminate Session',
      type: 'danger',
      onConfirm: () => {
        logout()
        navigate('/')
        setMobileMenuOpen(false)
      }
    })
  }

  const navItems = [
    { to: "/admin", end: true, icon: Users, label: "Cohort Watchtower" },
    { to: "/admin/cbt", icon: FileText, label: "CBT Infrastructure" },
    { to: "/admin/curriculum", icon: FileText, label: "Curriculum Flow" },
    { to: "/admin/results", icon: BarChart3, label: "Test Analytics" },
    { to: "/admin/messages", icon: MessageSquare, label: "Concierge Inbox" },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="w-80 h-screen sticky top-0 hidden lg:flex flex-col justify-between print:hidden border-r border-slate-800 shadow-2xl z-30" 
             style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #020617 100%)` }}>
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center p-0.5 shadow-lg shadow-teal-900/50" style={{background: `linear-gradient(135deg, ${TEAL} 0%, #054e52 100%)`}}>
              <div className="w-full h-full rounded-[14px] border border-white/20 flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
            </div>
            <div>
              <p className="font-display font-black text-white text-lg tracking-tight">Watchtower</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400">Admin Control</p>
            </div>
          </div>

          <div className="mb-10 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Active Surveillance</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} 
                className={({isActive}) => `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group ${isActive ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <item.icon size={20} className="shrink-0 transition-transform duration-300 group-hover:scale-110"/>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-8 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl border-2 border-white/10 flex items-center justify-center text-sm font-bold text-teal-400 bg-white/5">
              {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] font-medium text-white/30 truncate uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300 group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col w-full min-h-screen">
        <header className="flex items-center justify-between px-6 py-5 sticky top-0 z-40 print:hidden shadow-lg" style={{background:NAVY}}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:TEAL}}>
              <Shield size={18} className="text-white" />
            </div>
            <p className="font-display font-black text-white tracking-tight">Watchtower</p>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2 bg-white/5 rounded-xl transition-all active:scale-95">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{opacity:0, x:-300}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-300}} className="fixed inset-0 z-50 lg:hidden flex">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
               <aside className="relative w-80 h-full flex flex-col justify-between p-8" style={{background:NAVY}}>
                 <div>
                    <LogoSection TEAL={TEAL} />
                    <nav className="mt-12 space-y-2">
                       {navItems.map((item) => (
                         <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileMenuOpen(false)}
                           className={({isActive}) => `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400'}`}>
                           <item.icon size={20} />
                           {item.label}
                         </NavLink>
                       ))}
                    </nav>
                 </div>
                 <div>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-500">
                       <LogOut size={20}/> Sign out
                    </button>
                 </div>
               </aside>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 min-w-0 bg-slate-50 print:bg-white"><Outlet/></main>
      </div>

      <main className="hidden lg:flex flex-1 min-w-0 bg-slate-50 print:block overflow-x-hidden"><Outlet/></main>
    </div>
  )
}

function LogoSection({ TEAL }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:TEAL}}>
        <Shield size={20} className="text-white" />
      </div>
      <div>
        <p className="font-display font-black text-white text-lg tracking-tight">Watchtower</p>
      </div>
    </div>
  )
}