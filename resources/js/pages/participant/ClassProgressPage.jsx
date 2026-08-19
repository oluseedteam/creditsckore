import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle, Award, PlayCircle, BookOpen, Paperclip, X, Zap, Target, ArrowUpRight, ShieldCheck, Download, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurriculumQuery } from '../../hooks/queries'
import { DashboardSkeleton } from '../../components/ui/Loading'

const TEAL='#066A6F', NAVY='#0F172A', PGREEN='#10B981', GOLD='#F4B000', CORAL='#F43F5E'

export default function ClassProgressPage() {
  const { user } = useAuth()
  const { data: curriculum = [], loading } = useCurriculumQuery()
  const [selectedModule, setSelectedModule] = useState(null)

  const att = user?.attendance || {attended:0, total:0}
  const pct = Math.min((att.attended / 10) * 100, 100) // Assuming 10 sessions is a benchmark
  const completed = curriculum.filter(c => c.completed).length
  const radialData = [{ value: pct, fill: pct >= 75 ? PGREEN : pct >= 50 ? GOLD : CORAL }]
  const currPct = curriculum.length > 0 ? Math.round(completed / curriculum.length * 100) : 0

  if (loading) return <DashboardSkeleton />

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
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold text-[10px] uppercase tracking-widest shrink-0 border border-amber-500/20">Learning Laboratory</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Tracking Active</p>
          </div>
          <h1 className="font-display text-5xl font-black tracking-tighter text-slate-900 leading-none">Curriculum Journey</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="btn-secondary group">
             <Download size={18} className="group-hover:-translate-y-0.5 transition-transform"/> Progress Manifest
          </button>
          <button className="btn-primary group px-8">
             <ShieldCheck className="group-hover:rotate-12 transition-transform" size={18}/> Validate Mastery
          </button>
        </div>
      </header>

      {/* Intelligence Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Attendance Sessions', value: att.attended, sub: 'Lifetime total presence', icon: Calendar, color: TEAL },
          { label: 'Validated Modules', value: `${completed}/${curriculum.length}`, sub: 'Mastery protocols complete', icon: Zap, color: GOLD },
          { label: 'Overall Trajectory', value: `${currPct}%`, sub: 'Institutional readiness', icon: Target, color: CORAL },
          { label: 'Active Pipeline', value: curriculum[completed]?.title?.split(' ')[0] || 'COMPLETE', sub: curriculum[completed] ? `Week ${curriculum[completed].week} Sector` : 'Finalizing Data', icon: ArrowUpRight, color: PGREEN },
        ].map((s, i) => (
          <motion.div variants={fadeInUp} key={i} className="card p-8 group hover:border-teal-500/30 transition-all duration-500">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <s.icon size={20} style={{color: s.color}} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
             </div>
             <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1 uppercase">{s.value}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Mastery Visualization */}
         <motion.div variants={fadeInUp} className="card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Target size={120} className="text-teal-900 group-hover:rotate-45 transition-transform duration-1000" />
            </div>
            <div className="w-full text-left mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Mastery Index</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">75% Institutional Requirement</p>
            </div>
            <div className="relative w-full h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={12} fill={radialData[0].fill} background={{fill:'#f1f5f9'}} animationDuration={1500} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <p className="text-5xl font-black text-slate-900 tracking-tighter">{pct}%</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Readiness</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">{att.attended}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Present</p>
               </div>
               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-black text-slate-400 tracking-tighter">---</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Anomalies</p>
               </div>
            </div>
         </motion.div>

         {/* Learning Framework */}
         <motion.div variants={fadeInUp} className="card lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                     <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Curriculum Framework</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Staged institutional protocols</p>
                  </div>
               </div>
               <span className="text-[9px] font-black px-3 py-1 bg-white border border-slate-200 rounded-lg uppercase tracking-widest">Sector Lock Active</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar max-h-[600px] p-2 space-y-3">
               {curriculum.length === 0 ? (
                 <div className="p-20 text-center">
                    <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Zero Knowledge Nodes Available</p>
                 </div>
               ) : (
                 curriculum.map((week, idx) => (
                   <motion.div key={week.id} initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay: idx*0.05}} 
                        className={`p-6 rounded-3xl border transition-all duration-300 group relative overflow-hidden ${week.completed ? 'bg-emerald-50/30 border-emerald-100 shadow-emerald-500/5' : 'bg-white border-slate-100 hover:border-teal-200 shadow-sm'}`}>
                      {week.completed && <div className="absolute top-0 right-0 p-3"><ShieldCheck size={20} className="text-emerald-500/40" /></div>}
                      
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                         <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-colors ${week.completed ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                            <p className="text-[10px] font-black leading-none mb-1">WK</p>
                            <p className="text-xl font-black leading-none">{week.week}</p>
                         </div>
                         
                         <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                               <div>
                                  <h4 className={`text-base font-black tracking-tight leading-tight uppercase ${week.completed ? 'text-emerald-900' : 'text-slate-900'}`}>{week.title}</h4>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                     {(week.topics || []).map(t => (
                                       <span key={t} className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 uppercase tracking-tighter">{t}</span>
                                     ))}
                                  </div>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                  {week.file_path && (
                                    <a href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${week.file_path}`} 
                                       target="_blank" rel="noreferrer"
                                       className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
                                      <Paperclip size={16} />
                                    </a>
                                  )}
                                  {week.content && (
                                    <button onClick={() => setSelectedModule(week)}
                                      className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm">
                                      <BookOpen size={16} />
                                    </button>
                                  )}
                                  {week.cbt_test_id && (
                                    <Link to="/quiz" state={{ autoStartId: week.cbt_test_id }} 
                                          className={`px-4 py-2 flex items-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md ${week.completed ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-teal-600'}`}>
                                      Analyze <PlayCircle size={14} />
                                    </Link>
                                  )}
                               </div>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 ))
               )}
            </div>
         </motion.div>
      </div>

      <AnimatePresence>
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
            <motion.div initial={{opacity:0, scale:0.95, y:20}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:20}}
              className="bg-white rounded-[2.5rem] shadow-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden relative border border-white/20">
              <button onClick={() => setSelectedModule(null)} className="absolute right-8 top-8 w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all z-20 shadow-sm border border-slate-100">
                <X size={24} />
              </button>
              <div className="p-10 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2">
                   <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                   <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">Module Archive Sector {selectedModule.week}</p>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{selectedModule.title}</h3>
              </div>
              <div className="p-10 overflow-y-auto text-slate-600 text-base leading-relaxed whitespace-pre-wrap no-scrollbar font-medium">
                {selectedModule.content}
              </div>
              <div className="p-10 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <Target size={14} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Intelligence Node</p>
                </div>
                <button onClick={() => setSelectedModule(null)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Acknowledge Read</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-slate-900 p-8 rounded-[3rem] border border-white/10 shadow-3xl shadow-slate-900/60 relative overflow-hidden group print:hidden">
         <div className="absolute top-0 right-0 p-8 text-amber-500/10 group-hover:text-amber-500/20 transition-colors pointer-events-none">
            <Award size={160} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 flex items-center justify-center shadow-inner border border-amber-500/30">
               <Award size={32} className="text-amber-400" />
            </div>
            <div className="space-y-1 text-center md:text-left">
               <h4 className="text-lg font-black text-white tracking-tight uppercase">Institutional Milestone Protocol</h4>
               <p className="text-sm font-medium text-slate-400 max-w-xl">
                 Your curriculum progression is being synchronized with the global readiness matrix. Completion of all 8 sectors unlocks institutional qualification certificates.
               </p>
            </div>
            {currPct === 100 && (
              <div className="md:ml-auto">
                <button className="px-8 py-4 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                  Generate Certificate
                </button>
              </div>
            )}
         </div>
      </footer>
    </motion.div>
  )
}