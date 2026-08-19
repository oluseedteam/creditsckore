import { Link } from 'react-router-dom'
import { TrendingUp, BookOpen, Key, ArrowRight, CheckCircle, AlertTriangle, XCircle, Activity, Zap, Target, ShieldCheck, Download, Calendar, User, TrendingDown, ArrowUpRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts'
import { useAuth, getStatusFromScore } from '../../context/AuthContext'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { useMyCbtResultsQuery } from '../../hooks/queries'
import { DashboardSkeleton, Skeleton } from '../../components/ui/Loading'

const TEAL='#066A6F', NAVY='#0F172A', PGREEN='#10B981', GOLD='#F4B000', CORAL='#F43F5E'

function StatusBadge({ color, label }) {
  const barColor = color === 'green' ? PGREEN : color === 'yellow' ? GOLD : CORAL
  const StatusIcon = color === 'green' ? CheckCircle : color === 'yellow' ? AlertTriangle : XCircle
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border"
         style={{ background: `${barColor}15`, color: barColor, borderColor: `${barColor}30` }}>
      <StatusIcon size={12} /> {label}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: cbtResults = [], loading } = useMyCbtResultsQuery()

  const history = user?.credit_history || user?.creditHistory || []
  const latest  = history[history.length-1]
  const prev    = history[history.length-2]
  const status  = latest ? getStatusFromScore(latest.score) : null
  const delta   = latest && prev ? latest.score - prev.score : 0
  const pct     = latest ? Math.round(((latest.score - 300) / 550) * 100) : 0
  
  const attendedCount = user?.attendance?.attended || 0
  const barColor = status?.color === 'green' ? PGREEN : status?.color === 'yellow' ? GOLD : CORAL

  const chartData = history.map(h => ({
    month: format(new Date(h.month + '-01'), 'MMM yy'),
    score: h.score,
  }))

  const radialData = [{ value: pct, fill: barColor }]

  if (loading && !user) return <DashboardSkeleton />

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="p-8 lg:p-14 max-w-[1600px] mx-auto space-y-12 bg-mesh min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 font-bold text-[10px] uppercase tracking-widest shrink-0 border border-teal-500/20">Operational Cluster</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Financial Intelligence</p>
          </div>
          <h1 className="font-display text-5xl font-black tracking-tighter text-slate-900 leading-none">
            Howdy, {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="btn-secondary group">
             <Download size={18} className="group-hover:-translate-y-0.5 transition-transform"/> Intelligence Report
          </button>
          <Link to="/credit-score" className="btn-primary group px-8">
             <Zap className="group-hover:rotate-12 transition-transform" size={18}/> Update Score
          </Link>
        </div>
      </header>

      {/* Hero Analytics Grid */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Status Column */}
        <motion.div variants={fadeInUp} className="lg:col-span-1 space-y-8">
           <div className="card p-8 bg-slate-900 shadow-2xl shadow-slate-900/40 text-white relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent)] pointer-events-none" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 mb-8 flex items-center gap-2">
                <ShieldCheck size={14} /> Authorization Level
              </p>
              
              <div className="space-y-8">
                <div className="relative w-full aspect-square flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                        <RadialBar dataKey="value" cornerRadius={12} fill={barColor} background={{fill:'rgba(255,255,255,0.05)'}} animationDuration={2000} />
                      </RadialBarChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-5xl font-black tracking-tighter text-white">{latest?.score || '---'}</p>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Institutional Score</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 text-center">Eligibility Vector</p>
                    <div className="flex justify-center">
                       <StatusBadge color={status?.color} label={status?.label || 'UNRANKED'} />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-white/40 leading-relaxed text-center italic">
                    "{status?.description || "Incomplete data profiling. Submit intelligence to unlock eligibility mapping."}"
                  </p>
                </div>
              </div>
           </div>
        </motion.div>

        {/* Global Performance Columns */}
        <div className="lg:col-span-3 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Score Velocity', val: latest?.score || '---', icon: TrendingUp, color: barColor, sub: delta !== 0 ? (delta > 0 ? `+${delta} pts` : `${delta} pts`) : 'Static Flow' },
                { label: 'Mastery Quota', val: attendedCount, icon: BookOpen, color: '#6366F1', sub: 'Current session tally' },
                { label: 'Loan Gateway', val: status?.color === 'green' ? 'OPEN' : 'LOCKED', icon: Key, color: status?.color === 'green' ? PGREEN : GOLD, sub: status?.color === 'green' ? 'Gateway Authorized' : 'Mastery in Progress' }
               ].map((s, i) => (
                 <motion.div key={i} variants={fadeInUp} className="card p-8 group hover:border-teal-500/30 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity">
                       <s.icon size={60} style={{color: s.color}} />
                    </div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                         <s.icon size={20} style={{color: s.color}} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1 uppercase relative z-10">{s.val}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${i === 0 && delta < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {s.sub}
                    </p>
                 </motion.div>
               ))}
           </div>

           <div className="grid lg:grid-cols-2 gap-8">
              {/* Trajectory Map */}
              <motion.div variants={fadeInUp} className="card p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Institutional Trajectory</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-cycle growth mapping</p>
                  </div>
                  <Activity size={24} className="text-teal-500/20" />
                </div>
                
                <div className="h-[240px] w-full">
                  {chartData.length >= 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorDash" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={barColor} stopOpacity={0.15}/>
                            <stop offset="95%" stopColor={barColor} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis domain={[300, 850]} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '12px' }}
                          itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="score" stroke={barColor} strokeWidth={4} fillOpacity={1} fill="url(#colorDash)" animationDuration={2000} dot={{ r: 4, fill: 'white', stroke: barColor, strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-4xl border border-dashed text-slate-300">
                      <TrendingUp size={48} className="mb-4 opacity-40" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Trajectory Insufficient</p>
                      <p className="text-[8px] font-bold opacity-60 mt-1 uppercase">Submit next cycle intelligence</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Cognitive Results */}
              <motion.div variants={fadeInUp} className="card flex flex-col">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Cognitive Mastery</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">CBT performance logs</p>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                      <Zap size={18} />
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[300px] p-2 space-y-2 no-scrollbar">
                   {loading ? (
                     Array.from({ length: 3 }).map((_, i) => (
                       <div key={i} className="flex items-center gap-4 p-4 rounded-2xl animate-pulse">
                         <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                         <div className="flex-1 space-y-2">
                           <Skeleton className="h-3 w-32" />
                           <Skeleton className="h-2 w-24" />
                         </div>
                       </div>
                     ))
                   ) : cbtResults.length > 0 ? (
                     cbtResults.map((res, i) => {
                       const cpct = Math.round((res.score / res.total_questions) * 100)
                       return (
                         <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${cpct >= 50 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                                {cpct}%
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1">{res.test?.course || 'Assessment Module'}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{format(new Date(res.created_at), 'PPP')}</p>
                              </div>
                           </div>
                           <ArrowUpRight size={16} className="text-slate-300 group-hover:text-teal-600 transition-colors shrink-0" />
                         </div>
                       )
                     })
                   ) : (
                     <div className="p-16 text-center text-slate-200">
                        <Target size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest italic opacity-50">Zero Assessment Intel</p>
                     </div>
                   )}
                </div>
              </motion.div>
           </div>
        </div>
      </div>

      {/* Advanced Command Deck */}
      <motion.div variants={fadeInUp} className="space-y-6">
         <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Command Deck</h2>
            <div className="h-px flex-1 bg-slate-200" />
         </div>
         <div className="grid md:grid-cols-3 gap-6">
            {[
              { to: '/credit-score', icon: TrendingUp, label: 'Update Intelligence', desc: 'Recalculate monthly score', color: PGREEN, delay: 0.1 },
              { to: '/class-progress', icon: BookOpen, label: 'Sector Progress', desc: `${attendedCount} Validated sessions`, color: TEAL, delay: 0.2 },
              { to: '/loan-gateway', icon: Key, label: 'Capital Gateway', desc: status?.color === 'green' ? 'Gateway Authorized' : 'Locked: Target 670+', color: status?.color === 'green' ? PGREEN : GOLD, delay: 0.3 }
            ].map((item) => (
              <motion.div key={item.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: item.delay }}>
                 <Link to={item.to} className="card group p-8 flex flex-col justify-between h-full hover:border-slate-900 transition-all duration-500 overflow-hidden relative">
                    <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <item.icon size={80} />
                    </div>
                    <div className="space-y-4">
                       <div className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 active:scale-95"
                            style={{ background: `${item.color}10`, color: item.color, borderColor: `${item.color}20` }}>
                          <item.icon size={24} />
                       </div>
                       <div>
                          <p className="text-base font-black text-slate-900 tracking-tight uppercase">{item.label}</p>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">{item.desc}</p>
                       </div>
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-slate-900 transition-colors">Invoke Module</span>
                       <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" />
                    </div>
                 </Link>
              </motion.div>
            ))}
         </div>
      </motion.div>

      {/* Advanced Data Footer */}
      <footer className="bg-slate-900 p-8 rounded-[3rem] border border-white/10 shadow-3xl shadow-slate-900/60 relative overflow-hidden group print:hidden">
         <div className="absolute top-0 right-0 p-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors pointer-events-none">
            <User size={160} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 flex items-center justify-center shadow-inner border border-indigo-500/30">
               <ShieldCheck size={32} className="text-indigo-400" />
            </div>
            <div className="space-y-1 text-center md:text-left">
               <h4 className="text-lg font-black text-white tracking-tight uppercase">Protocol Integrity Verified</h4>
               <p className="text-sm font-medium text-slate-400 max-w-xl">
                 Your financial intelligence node is encrypted and synchronized with institutional servers. All data transformations are logged for auditing purposes.
               </p>
            </div>
            <div className="md:ml-auto">
               <button className="px-8 py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-500/10">
                 System Audit
               </button>
            </div>
         </div>
      </footer>
    </motion.div>
  )
}