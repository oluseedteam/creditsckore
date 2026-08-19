import { useState, Fragment } from 'react'
import { FileText, Search, User, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Printer, Download, BarChart3, Target, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { useCbtResultsQuery } from '../../hooks/queries'
import { TableSkeleton, RefreshIndicator } from '../../components/ui/Loading'

const NAVY='#102A43', PGREEN='#2FBF71', GOLD='#F4B000', CORAL='#F56A6A', TEAL='#066A6F'

export default function AdminResultsPage() {
  const { data: results = [], loading, isRefreshing } = useCbtResultsQuery()
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const filtered = results.filter(r => 
    r.user?.name.toLowerCase().includes(search.toLowerCase()) || 
    r.test?.course.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end gap-6 print:hidden">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight flex items-center gap-3" style={{color: NAVY}}>
            CBT Analytics
            <RefreshIndicator show={isRefreshing} />
          </h1>
          <p className="font-medium opacity-60 text-sm" style={{color: NAVY}}>Review participant performance and attempted questions.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold shadow-sm hover:border-teal-500 hover:text-teal-600 transition-all">
                <Printer size={14} /> Print Report
            </button>
        </div>
      </div>

      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <div className="relative w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 transition-all" 
            placeholder="Search participant or course..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={7} cols={5} />
      ) : (
      <div className="bg-white overflow-hidden rounded-4xl border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Participant</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Course</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Score</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(r => {
              const pct = Math.round((r.score / r.total_questions) * 100)
              const isExpanded = expandedId === r.id
              const initials = r.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'

              return (
                <Fragment key={r.id}>
                  <tr onClick={() => setExpandedId(isExpanded ? null : r.id)} className="hover:bg-gray-50/80 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform uppercase">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{color: NAVY}}>{r.user?.name}</p>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">Active User</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">{r.test?.course}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg" style={{color: pct >= 50 ? PGREEN : CORAL}}>{pct}%</span>
                        <div className="flex flex-col text-[9px] font-black uppercase text-gray-400 leading-none">
                           <span>{r.score} OK</span>
                           <span>{r.total_questions - r.score} ERR</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-500">{format(new Date(r.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end">
                        <div className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-navy-900 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                          {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                  {isExpanded && (
                    <motion.tr initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-gray-50/50">
                      <td colSpan={5} className="px-10 py-8">
                        <div className="space-y-6 max-w-5xl mx-auto">
                          {/* Mini Stats Bar */}
                          <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center"><Target size={20}/></div>
                               <div><p className="text-[10px] font-black text-gray-400 uppercase">Success Rate</p><p className="font-bold text-lg" style={{color: NAVY}}>{pct}%</p></div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle size={20}/></div>
                               <div><p className="text-[10px] font-black text-gray-400 uppercase">Correct</p><p className="font-bold text-lg" style={{color: PGREEN}}>{r.score}</p></div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><XCircle size={20}/></div>
                               <div><p className="text-[10px] font-black text-gray-400 uppercase">Incorrect</p><p className="font-bold text-lg" style={{color: CORAL}}>{r.total_questions - r.score}</p></div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <Activity size={14} className="text-gray-400" />
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Deep Assessment Drilldown</h4>
                          </div>
                          
                          <div className="grid gap-4">
                            {(r.test?.questions || []).map((q, idx) => {
                              const userAns = r.answers[q.id]
                              const isCorrect = userAns === q.correct_answer
                              return (
                                <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: idx * 0.05}}
                                  key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-200 transition-colors">
                                  <div className="flex justify-between items-start gap-6 mb-4">
                                    <div className="flex gap-4">
                                       <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</span>
                                       <p className="text-sm font-bold leading-relaxed" style={{color: NAVY}}>{q.text}</p>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                      {isCorrect ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                      {isCorrect ? 'Accurate' : 'Missed'}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {['A', 'B', 'C', 'D'].map(opt => {
                                      const optText = q[`option_${opt.toLowerCase()}`]
                                      const isSelected = userAns === opt
                                      const isCorrectOpt = q.correct_answer === opt
                                      return (
                                        <div key={opt} className={`text-[10px] p-3 rounded-xl border relative transition-all ${
                                          isCorrectOpt ? 'bg-emerald-50 border-emerald-500/30 text-emerald-900 font-bold' :
                                          isSelected && !isCorrectOpt ? 'bg-rose-50 border-rose-500/30 text-rose-900 font-bold' :
                                          'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                                        }`}>
                                          <div className="flex items-center gap-2">
                                             <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] ${
                                               isCorrectOpt ? 'bg-emerald-500 text-white' : 
                                               isSelected ? 'bg-rose-500 text-white' : 
                                               'bg-gray-200 text-gray-500'
                                             }`}>{opt}</span>
                                             <span className="truncate">{optText}</span>
                                          </div>
                                          {isSelected && (
                                            <span className={`absolute -top-2 -right-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter shadow-sm ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                                              Your Choice
                                            </span>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                  </AnimatePresence>
                </Fragment>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
      )}
    </motion.div>
  )
}
