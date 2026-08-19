import { useParams, Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, TrendingUp, BookOpen, Calendar, BarChart3, Activity, Shield, Zap, Target, Download, FileText, ArrowUpRight, ArrowDownRight, User, MoreVertical, ShieldAlert, UserCheck, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell, AreaChart, Area } from 'recharts'
import { useAuth, getStatusFromScore } from '../../context/AuthContext'
import { useDialog } from '../../context/DialogContext'
import toast from 'react-hot-toast'
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { useUsersQuery } from '../../hooks/queries'
import { DashboardSkeleton } from '../../components/ui/Loading'
import { invalidateCache } from '../../lib/queryCache'

// Consistent Theme Colors
const NAVY='#0F172A', PGREEN='#10B981', GOLD='#F4B000', CORAL='#F43F5E', TEAL='#066A6F'

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

export default function AdminParticipantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { api } = useAuth()
  const { showDialog } = useDialog()
  
  const { data: users = [], loading, refetch } = useUsersQuery()
  const user = useMemo(
    () => (users || []).find((u) => String(u.id) === String(id)),
    [users, id]
  )

  const fetchUser = () => {
    invalidateCache('users')
    refetch().catch(() => toast.error('Failed to refresh data'))
  }

  const handleApprove = () => {
    showDialog({
      title: 'Approve Account',
      message: `Approve and activate the account for ${user?.name}? They will receive an email notification.`,
      confirmLabel: 'Approve',
      type: 'success',
      onConfirm: async () => {
        try {
          await api.patch(`/users/${id}/status`, { status: 'active' })
          toast.success(`${user?.name} approved & activated!`)
          fetchUser()
        } catch { toast.error('Failed to approve account') }
      }
    })
  }

  const handleSuspend = () => {
    const isSuspended = user?.status === 'suspended'
    const newStatus = isSuspended ? 'active' : 'suspended'
    showDialog({
      title: isSuspended ? 'Restore Asset' : 'Isolate Asset',
      message: `Authorize status transition for ${user?.name} to [${newStatus.toUpperCase()}]?`,
      confirmLabel: 'Authorize',
      type: isSuspended ? 'success' : 'warning',
      onConfirm: async () => {
        try {
          await api.patch(`/users/${id}/status`, { status: newStatus })
          toast.success(`Status updated to ${newStatus}`)
          fetchUser()
        } catch { toast.error('Failed to update status') }
      }
    })
  }

  const handleDelete = () => {
    showDialog({
      title: 'Terminate Account',
      message: `Finalize complete erasure of participant '${user?.name}' from all secure sectors?`,
      confirmLabel: 'Confirm Terminate',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/users/${id}`)
          toast.success('Asset terminated')
          invalidateCache('users')
          navigate('/admin')
        } catch { toast.error('Termination sequence failed') }
      }
    })
  }

  if (loading) return <DashboardSkeleton />

  if (!user) return (
    <div className="p-20 text-center space-y-4">
       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <User size={40} className="text-slate-200" />
       </div>
       <h3 className="text-2xl font-black text-slate-900 tracking-tight">Asset Not Found</h3>
       <p className="text-slate-500">The requested participant record is not available in the current sector.</p>
       <Link to="/admin" className="btn-primary inline-flex mt-4 uppercase text-[10px] tracking-widest px-8">Return to Watchtower</Link>
    </div>
  )

  const history = user.credit_history || user.creditHistory || []
  const latest = history[history.length - 1]
  const status = latest ? getStatusFromScore(latest.score) : null
  
  const cbtResultsAll = user.cbt_results || user.cbtResults || []
  const completedCourses = new Set(cbtResultsAll.map(r => r.cbt_test_id)).size
  const totalCourses = 8 
  const attPct = Math.round((completedCourses / totalCourses) * 100)

  const delta = history.length >= 2 ? history[history.length - 1].score - history[history.length - 2].score : 0
  const barColor = status?.color === 'green' ? PGREEN : status?.color === 'yellow' ? GOLD : CORAL
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2)

  const chartData = history.map(h => ({
    month: format(new Date(h.month + '-01'), 'MMM yy'),
    score: h.score,
  }))

  const dailyAtt = user.daily_attendances || user.dailyAttendances || []
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  
  const thisWeekAttendances = dailyAtt.filter(a => {
    try {
      const d = parseISO(a.date)
      return isWithinInterval(d, { start: weekStart, end: weekEnd })
    } catch { return false }
  })
  
  const weeklyPresent = thisWeekAttendances.filter(a => a.status === 'present').length

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="p-8 lg:p-14 max-w-[1600px] mx-auto space-y-12 bg-mesh min-h-screen">
      {/* Pending Approval Banner */}
      {user.status === 'pending' && (
        <motion.div variants={fadeInUp} className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertTriangle size={24} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-amber-900 text-sm uppercase tracking-wide">Account Pending Approval</h3>
            <p className="text-amber-700 text-xs font-medium mt-1">{user.name} registered and is waiting for admin approval before they can access the portal.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={handleApprove} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5">
              <UserCheck size={14} /> Approve
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 px-5 py-2.5 bg-white text-rose-600 border border-rose-200 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all">
              <Trash2 size={14} /> Reject
            </button>
          </div>
        </motion.div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60 print:hidden">
        <div className="space-y-4">
          <Link to="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-teal-600 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Surveillance
          </Link>
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center p-0.5 shadow-2xl shadow-slate-900/40">
                <div className="w-full h-full rounded-[14px] border border-white/20 flex items-center justify-center text-white font-black text-xl">
                   {user.profile_picture ? (
                     <img src={user.profile_picture} className="w-full h-full rounded-[14px] object-cover" />
                   ) : initials}
                </div>
             </div>
             <div>
               <h1 className="font-display text-4xl font-black tracking-tighter text-slate-900 leading-tight uppercase">{user.name}</h1>
               <div className="flex items-center gap-3">
                 <p className="text-xs font-bold text-slate-400 tracking-tighter">{user.email}</p>
                 <div className="w-1 h-1 rounded-full bg-slate-200" />
                 <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Asset #{user.id?.toString().padStart(4, '0')}</p>
               </div>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="btn-secondary group">
             <Download size={18} className="group-hover:-translate-y-0.5 transition-transform"/> Export Report
          </button>
          {user.status === 'pending' ? (
            <button onClick={handleApprove} className="btn-primary group px-8 bg-emerald-600 hover:bg-emerald-700">
               <UserCheck className="group-hover:scale-110 transition-transform" size={18}/> Approve Account
            </button>
          ) : (
            <button onClick={handleSuspend} className={`btn-primary group px-8 ${user.status === 'suspended' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
               {user.status === 'suspended' 
                 ? <><UserCheck className="group-hover:scale-110 transition-transform" size={18}/> Restore Access</>
                 : <><ShieldAlert className="group-hover:rotate-12 transition-transform" size={18}/> Isolate Asset</>}
            </button>
          )}
          <button onClick={handleDelete} className="w-10 h-10 flex items-center justify-center bg-rose-50 border border-rose-200 text-rose-500 rounded-xl hover:bg-rose-100 transition-all" title="Delete Account">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Intelligence Grid */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Metric Column 1 */}
        <motion.div variants={fadeInUp} className="lg:col-span-1 space-y-8">
           <div className="card p-8 bg-slate-900 shadow-2xl shadow-slate-900/40 text-white relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent)] pointer-events-none" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 mb-8 flex items-center gap-2">
                <Target size={14} /> Profile Matrix
              </p>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Reporting Status</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[11px] font-black uppercase tracking-widest`}
                       style={{ borderColor: `${barColor}40`, backgroundColor: `${barColor}10`, color: barColor }}>
                    <div className="w-2 h-2 rounded-full animate-pulse shadow-sm" style={{ background: barColor }} />
                    {status?.label || 'INACTIVE'}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Asset Bio</p>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed italic line-clamp-4">
                    {user.about || "Analytical surveillance shows no self-reported data for this participant cluster."}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 py-0.5 border border-white/5 rounded">Network Rank</span>
                       <span className="text-xl font-black text-white italic">#14</span>
                    </div>
                </div>
              </div>
           </div>
        </motion.div>

        {/* Metric Column 2 - Main Stats */}
        <div className="lg:col-span-3 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Credit Position', val: latest?.score || '---', icon: TrendingUp, color: barColor, sub: delta !== 0 ? (delta > 0 ? `+${delta} pts` : `${delta} pts`) : 'Neutral Flow' },
                { label: 'Engagement Index', val: `${attPct}%`, icon: BookOpen, color: '#6366F1', sub: `${completedCourses}/${totalCourses} Protocols Complete` },
                { label: 'Persistence Log', val: user.attendance?.attended || 0, icon: Calendar, color: '#F59E0B', sub: `${weeklyPresent} Sessions this cycle` }
              ].map((s, i) => (
                <motion.div key={i} variants={fadeInUp} className="card p-8 group hover:border-teal-500/30 transition-all duration-500">
                   <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <s.icon size={20} style={{color: s.color}} />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                   </div>
                   <p className="text-5xl font-black text-slate-900 tracking-tighter mb-1">{s.val}</p>
                   <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${i === 0 && delta < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                     {s.sub}
                   </p>
                </motion.div>
              ))}
           </div>

           <div className="grid lg:grid-cols-2 gap-8">
              {/* Score Trend */}
              <motion.div variants={fadeInUp} className="card p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Score Trajectory</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-cycle performance map</p>
                  </div>
                  <TrendingUp size={24} className="text-teal-500/20" />
                </div>
                
                <div className="h-[280px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
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
                        <ReferenceLine y={670} stroke={PGREEN} strokeDasharray="6 6" strokeOpacity={0.6} label={{ value: 'TARGET MATRIX', position: 'insideTopRight', fontSize: 8, fontWeight: 900, fill: PGREEN }} />
                        <Area type="monotone" dataKey="score" stroke={barColor} strokeWidth={4} fillOpacity={1} fill="url(#colorArea)" animationDuration={2000} dot={{ r: 6, fill: 'white', stroke: barColor, strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed text-slate-300">
                      <TrendingUp size={48} className="mb-4 opacity-50" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Trajectory Records</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Assessment Records */}
              <motion.div variants={fadeInUp} className="card overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">CBT Protocols</h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                     <Zap size={10} /> System Final
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[380px] p-2 space-y-2 no-scrollbar">
                  {cbtResultsAll.length > 0 ? (
                    cbtResultsAll.map((res, i) => {
                      const pct = Math.round((res.score / res.total_questions) * 100)
                      return (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${pct >= 50 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                                {pct}%
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{res.test?.course || 'Assessment Module'}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{format(new Date(res.created_at), 'PPP')}</p>
                              </div>
                           </div>
                           <ArrowUpRight size={16} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-20 text-center text-slate-300">
                       <BookOpen size={40} className="mx-auto mb-4 opacity-40 hover:opacity-100 transition-opacity" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Assessment Attempts</p>
                    </div>
                  )}
                </div>
              </motion.div>
           </div>
        </div>
      </div>

      {/* Reporting Manifest */}
      <motion.div variants={fadeInUp} className="card overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div>
             <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Intelligence Log</h3>
             <p className="text-[10px] font-bold text-slate-400 tracking-[0.15em] uppercase mt-1">Full sector reporting history</p>
           </div>
           <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm">
             <MoreVertical size={20} />
           </button>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
               <tr className="bg-slate-50/30">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reporting Node</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status Vector</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Point Count</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Directives</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {[...history].reverse().map((entry, i) => {
                  const s = getStatusFromScore(entry.score)
                  return (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/50 shadow-inner">
                                <Calendar size={16} />
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 leading-tight uppercase">{format(new Date(entry.month + '-01'), 'MMMM yyyy')}</p>
                                {entry.note && <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{entry.note}</p>}
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <StatusBadge color={s.color} label={s.label} />
                       </td>
                       <td className="px-8 py-6">
                          <span className="text-xl font-black text-slate-900 tracking-tighter">{entry.score}</span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex gap-2">
                             <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 hover:scale-110 active:scale-95 transition-all shadow-sm">
                                <FileText size={14} />
                             </div>
                          </div>
                       </td>
                    </tr>
                  )
                })}
             </tbody>
          </table>
          {history.length === 0 && (
            <div className="p-32 text-center text-slate-200">
               <Shield size={64} className="mx-auto mb-6 opacity-20" />
               <p className="text-sm font-black uppercase tracking-widest italic opacity-50">Zero Records in Vault</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Advanced Notification Footer */}
      <footer className="bg-slate-900 p-8 rounded-[3rem] border border-white/10 shadow-3xl shadow-slate-900/60 relative overflow-hidden group print:hidden">
         <div className="absolute top-0 right-0 p-8 text-teal-500/10 group-hover:text-teal-500/20 transition-colors pointer-events-none">
            <Shield size={160} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-teal-500/20 flex items-center justify-center shadow-inner border border-teal-500/30">
               <ShieldAlert size={32} className="text-teal-400 animate-pulse" />
            </div>
            <div className="space-y-1 text-center md:text-left">
               <h4 className="text-lg font-black text-white tracking-tight uppercase">High-Level Encryption Protocol</h4>
               <p className="text-sm font-medium text-slate-400 max-w-xl">
                 Accessing restricted participant mainframe. All interactions are monitored and recorded for institutional auditing. Point variance above 5% triggers automatic verification alerts.
               </p>
            </div>
            <div className="md:ml-auto">
               <button className="px-8 py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-teal-50 transition-all shadow-xl shadow-teal-500/10">
                 Acknowledge & Proceed
               </button>
            </div>
         </div>
      </footer>
    </motion.div>
  )
}