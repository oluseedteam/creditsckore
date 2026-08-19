import { Link } from 'react-router-dom'
import { MessageSquare, User, Clock, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { useMessagesQuery } from '../../hooks/queries'
import { RefreshIndicator } from '../../components/ui/Loading'

const NAVY = '#102A43', TEAL = '#066A6F', PGREEN = '#2FBF71'

export default function AdminMessagesPage() {
  const { data: messages = [], loading, isRefreshing } = useMessagesQuery()

  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2 flex items-center gap-3" style={{color: NAVY}}>
          Direct Concierge Inbox
          <RefreshIndicator show={isRefreshing} />
        </h1>
        <p className="font-medium opacity-60" style={{color: NAVY}}>Manage and review participant inquiries.</p>
      </div>

      <div className="bg-white overflow-hidden rounded-4xl border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-4 lg:px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Sender Profile</th>
                <th className="px-4 lg:px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Message Content</th>
                <th className="hidden sm:table-cell px-4 lg:px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Received</th>
                <th className="px-4 lg:px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="flex items-center gap-4 animate-pulse">
                          <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-32" />
                            <div className="h-3 bg-slate-200 rounded w-48" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : messages.length === 0 ? (
                   <tr><td colSpan={4} className="text-center py-10 opacity-50">No messages found.</td></tr>
                ) : messages.map(m => (
                  <motion.tr key={m.id} initial={{opacity:0}} animate={{opacity:1}} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 lg:px-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 lg:w-9 lg:h-9 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ background: TEAL }}>
                          {m.name ? m.name.substring(0, 2).toUpperCase() : 'GU'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate" style={{color: NAVY}}>{m.name || 'Unknown'}</p>
                          <p className="text-[10px] font-medium text-gray-400 truncate">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 align-top max-w-[200px] lg:max-w-xs">
                      <p className="text-sm text-gray-600 line-clamp-3" title={m.message}>{m.message}</p>
                      {/* Mobile timestamp fallback since col is hidden */}
                      <p className="sm:hidden text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                        <Clock size={10}/> {format(new Date(m.created_at), 'MMM d, yyyy')}
                      </p>
                    </td>
                    <td className="hidden sm:table-cell px-4 lg:px-6 py-4 align-top">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 whitespace-nowrap">
                        <Clock size={12} />
                        {format(new Date(m.created_at), 'MMM d, h:mm a')}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 align-top text-right">
                       {m.user_id ? (
                         <Link to={`/admin/participant/${m.user_id}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest">
                           <User size={14} /> Profile
                         </Link>
                       ) : (
                         <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase text-gray-400 bg-gray-100 rounded">
                           <AlertCircle size={10} /> Unlinked
                         </span>
                       )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
