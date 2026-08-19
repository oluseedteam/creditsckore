import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Edit, Save, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDialog } from '../../context/DialogContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useCbtTestQuery } from '../../hooks/queries'
import { ListSkeleton, PageLoader } from '../../components/ui/Loading'
import { invalidateCache } from '../../lib/queryCache'

// Theme Constants
const NAVY = '#102A43'
const TEAL = '#066A6F'
const PGREEN = '#2FBF71'

function QuestionItem({ q, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editQ, setEditQ] = useState({
    text: q.text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer
  })

  const handleSave = async () => {
    const loadId = toast.loading('Saving question...')
    try {
      await onUpdate(q.id, editQ)
      setIsEditing(false)
      toast.success('Question updated', { id: loadId })
    } catch {
      toast.error('Failed to update question', { id: loadId })
    }
  }

  return (
    <div className="group relative">
      {isEditing ? (
        <div className="p-6 rounded-2xl border-2 border-teal-500 bg-white shadow-xl space-y-4">
          <textarea rows="2" className="w-full text-sm font-bold border-gray-100 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-teal-500/20" 
            value={editQ.text} onChange={e=>setEditQ({...editQ, text: e.target.value})} />
          <div className="grid grid-cols-2 gap-3 text-xs">
            {['a','b','c','d'].map(key => (
              <div key={key}>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1">Option {key.toUpperCase()}</label>
                <input className="w-full border-none bg-gray-50 rounded-lg p-2.5" 
                  value={editQ[`option_${key}`]} onChange={e=>setEditQ({...editQ, [`option_${key}`]: e.target.value})} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
             <label className="text-xs font-bold text-gray-500">Correct Answer</label>
             <div className="flex gap-3">
               {['A', 'B', 'C', 'D'].map(opt => (
                 <label key={opt} className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 cursor-pointer transition-all ${editQ.correct_answer === opt ? 'bg-teal-600 border-teal-600 text-white font-bold' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                   <input type="radio" name={`edit-correct-${q.id}`} value={opt} checked={editQ.correct_answer === opt}
                     onChange={e => setEditQ({...editQ, correct_answer: e.target.value})} className="hidden" />
                   <span className="text-xs">{opt}</span>
                 </label>
               ))}
             </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
             <button onClick={()=>setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
             <button onClick={handleSave} className="flex gap-2 items-center px-6 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-900/20"><Save size={16}/> Save Changes</button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-teal-100 transition-all group">
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <p className="font-bold text-sm mb-3 flex items-start gap-2" style={{color: NAVY}}>
                <span className="shrink-0 w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-[10px]">Q</span>
                {q.text}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 ml-8">
                {['a','b','c','d'].map(key => (
                  <div key={key} className={`text-xs p-2 rounded-lg ${q.correct_answer === key.toUpperCase() ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100' : 'text-gray-500'}`}>
                    <span className="mr-2 opacity-50">{key.toUpperCase()}.</span> {q[`option_${key}`]}
                    {q.correct_answer === key.toUpperCase() && <CheckCircle size={10} className="inline ml-1" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={()=>setIsEditing(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-teal-600 transition-colors">
                <Edit size={16} />
              </button>
              <button onClick={()=>onDelete(q.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminCBTDetailsPage() {
  const { id } = useParams()
  const { api } = useAuth()
  const { showDialog } = useDialog()
  const { data: test, loading, refetch } = useCbtTestQuery(id)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQ, setNewQ] = useState({
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A'
  })

  const fetchDetails = () => {
    invalidateCache(`cbt-tests:${id}`)
    refetch().catch(() => toast.error('Failed to load test details'))
  }

  const handleAddQuestion = async () => {
    if (!newQ.text || !newQ.option_a || !newQ.option_b) {
      toast.error('Question and at least two options are required')
      return
    }
    const lid = toast.loading('Adding question...')
    try {
      await api.post(`/cbt-tests/${id}/questions`, newQ)
      toast.success('Question added successfully', { id: lid })
      setNewQ({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A' })
      setShowAddForm(false)
      fetchDetails()
    } catch {
      toast.error('Error adding question', { id: lid })
    }
  }

  const updateQuestion = async (qId, qData) => {
    await api.put(`/cbt-tests/${id}/questions/${qId}`, qData)
    fetchDetails()
  }

  const deleteQuestion = (qId) => {
    showDialog({
      title: 'Delete Question?',
      message: 'This action cannot be undone. Are you sure you want to remove this question from the pool?',
      confirmLabel: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        const lid = toast.loading('Deleting...')
        try {
          await api.delete(`/cbt-tests/${id}/questions/${qId}`)
          toast.success('Question deleted', { id: lid })
          fetchDetails()
        } catch {
          toast.error('Error deleting question', { id: lid })
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
        <PageLoader label="Loading course pool..." />
        <ListSkeleton rows={5} />
      </div>
    )
  }
  
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/admin/cbt" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-navy-900 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Course Pool
        </Link>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary py-2 px-4 flex items-center gap-2 shadow-lg" style={{background: TEAL}}>
           {showAddForm ? 'Cancel' : 'Add New Question'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="overflow-hidden">
            <div className="card p-6 border-2 border-teal-500/20 bg-teal-50/10">
              <h3 className="font-bold text-lg mb-4" style={{color: NAVY}}>New Question Entry</h3>
              <div className="space-y-4">
                <textarea rows="3" value={newQ.text} onChange={e=>setNewQ({...newQ, text: e.target.value})}
                  className="w-full p-3 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Enter the question here..."></textarea>
                <div className="grid grid-cols-2 gap-4">
                  {['a','b','c','d'].map(opt => (
                    <div key={opt}>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Option {opt.toUpperCase()}</label>
                      <input type="text" value={newQ[`option_${opt}`]} onChange={e=>setNewQ({...newQ, [`option_${opt}`]: e.target.value})}
                        className="w-full p-2.5 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20"
                        placeholder={`Option ${opt.toUpperCase()}`} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-gray-500">Correct Answer</label>
                  <div className="flex gap-3">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <label key={opt} className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 cursor-pointer transition-all ${newQ.correct_answer === opt ? 'bg-teal-600 border-teal-600 text-white font-bold' : 'bg-white border-transparent text-gray-400'}`}>
                        <input type="radio" value={opt} checked={newQ.correct_answer === opt}
                          onChange={e => setNewQ({...newQ, correct_answer: e.target.value})} className="hidden" />
                        <span className="text-xs">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                   <button onClick={handleAddQuestion} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-teal-900/20 hover:bg-teal-700 transition-all">
                     Confirm & Add
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2" style={{color: NAVY}}>{test?.course}</h1>
          <p className="font-medium opacity-60" style={{color: NAVY}}>{test?.questions?.length || 0} Questions in this pool · {test?.timeLapsMinutes || 0} Min Duration</p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {test?.questions?.map((q, i) => (
            <motion.div key={q.id} initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} transition={{delay: i * 0.05}}>
              <QuestionItem q={q} onUpdate={updateQuestion} onDelete={deleteQuestion} />
            </motion.div>
          ))}
        </AnimatePresence>
        {(!test?.questions || test?.questions.length === 0) && (
            <p className="p-20 text-center text-sm font-bold text-gray-300 uppercase tracking-widest">No questions available for this pool.</p>
        )}
      </div>
    </div>
  )
}
