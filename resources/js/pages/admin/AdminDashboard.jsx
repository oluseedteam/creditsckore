import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, CheckCircle, AlertTriangle, XCircle, Users, TrendingUp, Award, Activity, Trash2, ShieldAlert, UserCheck, Shield, Zap, Target, Download, MoreVertical, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { useDialog } from '../../context/DialogContext'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useUsersQuery } from '../../hooks/queries'
import { StatCardsSkeleton, TableSkeleton, RefreshIndicator } from '../../components/ui/Loading'
import { invalidateCache } from '../../lib/queryCache'

// Theme Constants
const NAVY = '#0F172A', PGREEN = '#10B981', GOLD = '#F4B000', CORAL = '#F43F5E', TEAL = '#066A6F'

function StatusBadge({ color, label }) {
  const themes = {
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500', icon: CheckCircle },
    yellow: { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500', icon: AlertTriangle },
    red: { bg: 'bg-rose-500/10', text: 'text-rose-500', dot: 'bg-rose-500', icon: XCircle },
    gray: { bg: 'bg-slate-500/10', text: 'text-slate-500', dot: 'bg-slate-500', icon: Activity }
  }
  const theme = themes[color] || themes.gray
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.bg} ${theme.text} border border-white/10`}>
      <div className={`w-1 h-1 rounded-full ${theme.dot}`} />
      {label}
    </span>
  )
}

export default function AdminDashboard() {
  const { api } = useAuth()
  const { showDialog } = useDialog()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { data: users, loading, isRefreshing, refetch, error } = useUsersQuery()
  const userList = users ?? []

  const fetchUsers = () => {
    invalidateCache('users')
    refetch().catch(() => toast.error('Failed to load participants — please sign in again'))
  }

  if (error && !userList.length) {
    return (
      <div className="p-14 text-center space-y-4">
        <p className="text-slate-500 font-medium">Could not load participant data.</p>
        <button type="button" onClick={fetchUsers} className="btn-primary">Retry</button>
      </div>
    )
  }

  const deleteUser = (id, name) => {
    showDialog({
      title: 'Terminate Account',
      message: `Finalize complete erasure of participant '${name}' from all secure sectors?`,
      confirmLabel: 'Confirm Terminate',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/users/${id}`)
          toast.success('Asset terminated')
          fetchUsers()
        } catch { toast.error('Termination sequence failed') }
      }
    })
  }

  const toggleSuspend = (id, currentStatus, name) => {
    const isPending = currentStatus === 'pending'
    const isSuspended = currentStatus === 'suspended'
    const newStatus = (isPending || isSuspended) ? 'active' : 'suspended'
    const title = isPending ? 'Approve Account' : isSuspended ? 'Restore Asset' : 'Isolate Asset'
    const message = isPending
      ? `Approve and activate the account for ${name}? They will receive an email notification.`
      : `Authorize status transition for ${name} to [${newStatus.toUpperCase()}]?`
    showDialog({
      title,
      message,
      confirmLabel: isPending ? 'Approve' : 'Authorize',
      type: newStatus === 'suspended' ? 'warning' : 'success',
      onConfirm: async () => {
        try {
          await api.patch(`/users/${id}/status`, { status: newStatus })
          toast.success(isPending ? `${name} approved & activated!` : `Asset status updated to ${newStatus}`)
          fetchUsers()
        } catch { toast.error('Verification authority failure') }
      }
    })
  }

  const markAttendance = async (userId, userStatus) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      await api.post('/attendance/mark', { user_id: userId, date: today, status: userStatus })
      toast.success(`Logged ${userStatus.toUpperCase()} for session`)
      fetchUsers()
    } catch { toast.error('Session logging failure') }
  }

  const enriched = useMemo(() => userList.map(u => {
    const latest = u.creditHistory?.[u.creditHistory.length - 1] || u.credit_history?.[u.credit_history.length - 1]
    const creditScore = latest?.score || 0
    const results = u.cbt_results || u.cbtResults || []
    const totalPossible = results.reduce((sum, r) => sum + (r.total_questions || 0), 0)
    const totalEarned = results.reduce((sum, r) => sum + (r.score || 0), 0)
    const cbtAvg = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : null

    let status = { label: 'Incomplete', color: 'gray' }
    if (u.status === 'suspended') {
      status = { label: 'Isolated', color: 'red' }
    } else if (u.status === 'pending') {
      status = { label: 'Review Required', color: 'yellow' }
    } else if (creditScore > 0) {
      if (creditScore >= 670 && (cbtAvg === null || cbtAvg >= 70)) status = { label: 'Optimal', color: 'green' }
      else if (creditScore < 580 || (cbtAvg !== null && cbtAvg < 50)) status = { label: 'Sub-Par', color: 'red' }
      else status = { label: 'Cautionary', color: 'yellow' }
    }

    const attendanceCount = u.attendance?.attended || 0
    const creditHist = u.creditHistory || u.credit_history || []
    const delta = creditHist.length >= 2 ? creditHist[creditHist.length - 1].score - creditHist[creditHist.length - 2].score : 0
      
    return { ...u, latest, accountStatus: status, attendanceCount, delta, cbtAvg }
  }), [userList])

  const filtered = useMemo(() => enriched.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || u.accountStatus.color === filter
    return matchSearch && matchFilter
  }), [enriched, search, filter])

  const counts = {
    all: enriched.length,
    active: enriched.filter(u => u.status === 'active').length,
    green: enriched.filter(u => u.accountStatus.color === 'green').length,
    yellow: enriched.filter(u => u.accountStatus.color === 'yellow').length,
    red: enriched.filter(u => u.accountStatus.color === 'red').length,
  }

  return (
    <div className="p-8 lg:p-14 max-w-[1600px] mx-auto space-y-12 bg-mesh min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 font-bold text-[10px] uppercase tracking-widest shrink-0 border border-teal-500/20">System Live</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Watchtower v4.2</p>
          </div>
          <h1 className="font-display text-5xl font-black tracking-tighter text-slate-900 leading-none flex items-center gap-3">
            Cohort Intelligence
            <RefreshIndicator show={isRefreshing} />
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="btn-secondary group">
             <Download size={18} className="group-hover:-translate-y-0.5 transition-transform"/> Secure Archive
          </button>
          <button className="btn-primary group">
             <Shield className="group-hover:rotate-12 transition-transform" size={18}/> Deploy Protocol
          </button>
        </div>
      </header>

      {/* Control Console Stats */}
      {loading ? (
        <StatCardsSkeleton count={4} />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Network Cohort', val: counts.all, icon: Users, color: '#6366F1', trend: '+12% this cycle' },
          { label: 'Active Sessions', val: counts.active, icon: Zap, color: '#10B981', trend: '98.2% availability' },
          { label: 'Optimization Rate', val: `${Math.round((counts.green/counts.all)*100 || 0)}%`, icon: Target, color: '#F43F5E', trend: 'High Priority' },
          { label: 'Security Status', val: 'A+', icon: Shield, color: '#F59E0B', trend: 'Encryption Active' }
        ].map((s, i) => (
          <div key={i} className="card p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <s.icon size={80} style={{color: s.color}} />
            </div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-100 transition-colors shadow-sm">
                  <s.icon size={20} style={{color: s.color}} />
               </div>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">{s.label}</p>
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{s.val}</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{s.trend}</p>
          </div>
        ))}
      </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Advanced Filters */}
        <div className="lg:w-80 space-y-6">
           <div className="card p-6 bg-slate-900 shadow-2xl shadow-slate-900/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-teal-500/20 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-4 flex items-center gap-2">
                  <Activity size={12} /> Surveillance Log
                </p>
                <div className="space-y-4">
                  <button onClick={() => setFilter('all')} className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border ${filter === 'all' ? 'bg-white/10 border-white/20 text-white shadow-lg' : 'border-transparent text-slate-400 hover:bg-white/5'}`}>
                    <span className="text-xs font-bold uppercase tracking-widest">Global Asset Pool</span>
                    <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-lg">{counts.all}</span>
                  </button>
                  <button onClick={() => setFilter('green')} className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border ${filter === 'green' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'border-transparent text-slate-400 hover:bg-white/5'}`}>
                    <span className="text-xs font-bold uppercase tracking-widest">Optimal Vectors</span>
                    <span className="text-[10px] font-black bg-emerald-500/20 px-2 py-0.5 rounded-lg">{counts.green}</span>
                  </button>
                  <button onClick={() => setFilter('yellow')} className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border ${filter === 'yellow' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10' : 'border-transparent text-slate-400 hover:bg-white/5'}`}>
                    <span className="text-xs font-bold uppercase tracking-widest">Cautionary Risks</span>
                    <span className="text-[10px] font-black bg-amber-500/20 px-2 py-0.5 rounded-lg">{counts.yellow}</span>
                  </button>
                  <button onClick={() => setFilter('red')} className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border ${filter === 'red' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/10' : 'border-transparent text-slate-400 hover:bg-white/5'}`}>
                    <span className="text-xs font-bold uppercase tracking-widest">Critical Anomalies</span>
                    <span className="text-[10px] font-black bg-rose-500/20 px-2 py-0.5 rounded-lg">{counts.red}</span>
                  </button>
                </div>
              </div>
           </div>

           <div className="card p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Trajectory Map</p>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enriched.slice(0, 7)}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#066A6F" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#066A6F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="latest.score" stroke="#066A6F" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Master Asset List */}
        <div className="flex-1 space-y-6 min-w-0">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-3xl border border-slate-200 shadow-sm relative group overflow-hidden">
             <div className="absolute inset-0 bg-linear-to-r from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex-1 group/search">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-teal-600 transition-all" />
                <input className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500/30 placeholder-slate-400 transition-all outline-none" 
                       placeholder="Identifer search (Name, Hash, Email)..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
             <button className="hidden md:flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
               Filter Matrix
             </button>
          </div>

          {loading ? (
            <TableSkeleton rows={8} cols={4} />
          ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Unique Asset ID</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Threat Assessment</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trajectory Score</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Admin Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode='popLayout'>
                    {filtered.map(u => (
                      <motion.tr key={u.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} layout className="hover:bg-slate-50/80 transition-all group overflow-hidden relative">
                        <td className="px-8 py-7 group-hover:translate-x-1 transition-transform">
                          <div className="flex items-center gap-5">
                            <div className="relative shrink-0">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black shadow-xl shadow-slate-200 group-hover:scale-105 transition-transform duration-500`}
                                     style={{ background: u.accountStatus?.color === 'gray' ? '#f1f5f9' : 
                                                        u.accountStatus?.color === 'green' ? '#ecfdf5' : 
                                                        u.accountStatus?.color === 'yellow' ? '#fdf8e6' : '#fff1f2',
                                              color: u.accountStatus?.color === 'gray' ? '#64748b' : 
                                                     u.accountStatus?.color === 'green' ? '#059669' : 
                                                     u.accountStatus?.color === 'yellow' ? '#d97706' : '#e11d48',
                                              border: '1px solid currentColor', borderAlpha: 0.1 }}>
                                  {u.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm`}>
                                   <Zap size={12} className={u.status === 'active' ? 'text-emerald-500' : 'text-slate-300'} />
                                </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-base font-black text-slate-900 tracking-tight leading-tight group-hover:text-teal-700 transition-colors uppercase">{u.name}</p>
                              <p className="text-xs font-bold text-slate-400/80 tracking-tighter mt-1">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex flex-col gap-2">
                             <StatusBadge color={u.accountStatus.color} label={u.accountStatus.label} />
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                   <Zap size={10} className="text-teal-500" /> CBT: {u.cbtAvg !== null ? `${Math.round(u.cbtAvg)}%` : '---'}
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                   <Clock size={10} className="text-amber-500" /> ATD: {u.attendanceCount}
                                </div>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                           <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{u.latest?.score || '---'}</span>
                              {u.delta !== 0 && (
                                <span className={`flex items-center gap-0.5 text-[11px] font-black ${u.delta > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {u.delta > 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                                  {Math.abs(u.delta)}
                                </span>
                              )}
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Point Variance</p>
                        </td>
                        <td className="px-8 py-7 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {/* Proximity Attendance Controls */}
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm group/att">
                              <button onClick={() => markAttendance(u.id, 'present')} className="px-3 py-2 rounded-lg text-[10px] font-black text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100" title="Presence Matrix">P</button>
                              <div className="w-px h-4 bg-slate-100" />
                              <button onClick={() => markAttendance(u.id, 'absent')} className="px-3 py-2 rounded-lg text-[10px] font-black text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100" title="Absent Void">A</button>
                            </div>

                            <Link to={`/admin/participant/${u.id}`} className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all">
                              <ArrowUpRight size={18} />
                            </Link>

                            <div className="relative group/more">
                               <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 transition-all">
                                  <MoreVertical size={18} />
                               </button>
                               <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 scale-95 translate-y-2 pointer-events-none group-hover/more:opacity-100 group-hover/more:scale-100 group-hover/more:translate-y-0 transition-all z-20">
                                  {u.status === 'pending' && (
                                    <button onClick={() => toggleSuspend(u.id, u.status, u.name)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-3 border-b border-slate-50">
                                       <UserCheck size={14} className="text-emerald-500"/> Approve Account
                                    </button>
                                  )}
                                  {u.status !== 'pending' && (
                                    <button onClick={() => toggleSuspend(u.id, u.status, u.name)} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                       {u.status === 'suspended' ? <UserCheck size={14} className="text-emerald-500"/> : <ShieldAlert size={14} className="text-amber-500" />}
                                       {u.status === 'suspended' ? 'Restore Asset' : 'Isolate Asset'}
                                    </button>
                                  )}
                                  <button onClick={() => deleteUser(u.id, u.name)} className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3">
                                     <Trash2 size={14} /> Erase Record
                                  </button>
                               </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}