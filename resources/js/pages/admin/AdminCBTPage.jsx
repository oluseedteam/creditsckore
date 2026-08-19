import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Upload, Save, Trash2, Clock, BookOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDialog } from '../../context/DialogContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useCbtTestsQuery } from '../../hooks/queries'
import { ListSkeleton, RefreshIndicator } from '../../components/ui/Loading'
import { invalidateCache } from '../../lib/queryCache'

// Theme Constants
const NAVY = '#102A43'
const TEAL = '#066A6F'
const PGREEN = '#2FBF71'

export default function AdminCBTPage() {
  const { api } = useAuth()
  const { showDialog } = useDialog()
  const [course, setCourse] = useState('')
  const [timeLapse, setTimeLapse] = useState(30)
  const [questions, setQuestions] = useState([])
  const { data: cbtTests = [], loading, isRefreshing, refetch } = useCbtTestsQuery()
  const [currentQ, setCurrentQ] = useState({
    text: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A'
  })

  const fetchCBTs = () => {
    invalidateCache('cbt-tests')
    refetch().catch(() => toast.error('Failed to fetch tests'))
  }

  const addQuestion = () => {
    if (!currentQ.text || !currentQ.options.A || !currentQ.options.B) {
      toast.error('Please fill in the question and at least two options.')
      return
    }
    setQuestions([...questions, { ...currentQ, id: Date.now() }])
    setCurrentQ({ text: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A' })
    toast.success('Question added to draft.')
  }

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id))
    toast.success('Question removed from draft.')
  }

  const saveCBT = async () => {
    const loadId = toast.loading('Saving CBT...')
    try {
      const cbtData = { course, timeLapsMinutes: timeLapse, questions }
      await api.post('/cbt-tests', cbtData)
      toast.success('CBT Questions configured and saved successfully!', { id: loadId })
      setCourse('')
      setQuestions([])
      fetchCBTs()
    } catch {
      toast.error('Error saving CBT Test', { id: loadId })
    }
  }

  const deleteCBT = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    
    showDialog({
      title: 'Delete CBT Test',
      message: 'Are you sure you want to delete this CBT test? This will also remove all associated questions and cannot be undone.',
      confirmLabel: 'Delete Permanently',
      type: 'danger',
      onConfirm: async () => {
        const loadId = toast.loading('Deleting course...')
        try {
          await api.delete(`/cbt-tests/${id}`)
          toast.success('CBT test deleted successfully.', { id: loadId })
          fetchCBTs()
        } catch {
          toast.error('Error deleting CBT test. Is it linked to a curriculum?', { id: loadId })
        }
      }
    })
  }

  const toggleStatus = async (e, id, currentStatus) => {
    e.preventDefault()
    e.stopPropagation()
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft'
    try {
      await api.put(`/cbt-tests/${id}`, { status: newStatus })
      toast.success(`Exam marked as ${newStatus}`)
      fetchCBTs()
    } catch { toast.error('Failed to update status') }
  }

  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2 flex items-center gap-3" style={{color: NAVY}}>
          CBT Configuration
          <RefreshIndicator show={isRefreshing} />
        </h1>
        <p className="font-medium opacity-60" style={{color: NAVY}}>Upload questions and set test parameters for participants.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Test Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 border-t-4" style={{borderTopColor: TEAL}}>
            <h3 className="font-bold text-lg mb-4" style={{color: NAVY}}>General Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Course</label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={course} onChange={e => setCourse(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20"
                    placeholder="e.g. Financial Literacy" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Time Lapse (Minutes)</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" min="1" value={timeLapse} onChange={e => setTimeLapse(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20"
                    placeholder="30" />
                </div>
              </div>
            </div>

            <button onClick={saveCBT} disabled={questions.length === 0 || !course}
              className="mt-6 w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{background: TEAL}}>
              <Save size={18} /> Save & Publish CBT
            </button>
          </div>
        </div>

        {/* Question Upload */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white overflow-hidden rounded-4xl border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-6 lg:p-8">
            <h3 className="font-bold text-lg mb-4" style={{color: NAVY}}>Add Question</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Question Text</label>
                <textarea rows="3" value={currentQ.text} onChange={e => setCurrentQ({...currentQ, text: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Enter the question here..."></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt}>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Option {opt}</label>
                    <input type="text" value={currentQ.options[opt]} onChange={e => setCurrentQ({...currentQ, options: {...currentQ.options, [opt]: e.target.value}})}
                      className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20"
                      placeholder={`Option ${opt}`} />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-3">Correct Answer</label>
                <div className="flex gap-4">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <label key={opt} className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 cursor-pointer transition-all ${currentQ.correctAnswer === opt ? 'bg-teal-600 border-teal-600 text-white font-bold shadow-lg ring-4 ring-teal-500/20' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}>
                      <input type="radio" value={opt} checked={currentQ.correctAnswer === opt}
                        onChange={e => setCurrentQ({...currentQ, correctAnswer: e.target.value})} className="hidden" />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={addQuestion} className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                  style={{background: `${PGREEN}15`, color: PGREEN}}>
                  <PlusCircle size={16} /> Add to List
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden rounded-4xl border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-6 lg:p-8">
            <h3 className="font-bold text-lg mb-4 flex justify-between items-center" style={{color: NAVY}}>
              Question Pool (Draft)
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{questions.length} Questions</span>
            </h3>
            <div className="space-y-3">
              {questions.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <Upload size={32} className="mx-auto mb-3" />
                  <p className="text-sm font-medium">No questions added yet.</p>
                </div>
              ) : (
                questions.map((q, i) => (
                  <div key={q.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex justify-between gap-4 group">
                    <div className="min-w-0">
                      <p className="font-bold text-sm mb-2" style={{color: NAVY}}><span className="text-teal-600 mr-2">Q{i+1}.</span>{q.text}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <span>A: {q.options.A}</span>
                        <span>B: {q.options.B}</span>
                        <span>C: {q.options.C}</span>
                        <span>D: {q.options.D}</span>
                      </div>
                      <p className="text-xs font-bold mt-2" style={{color: PGREEN}}>Correct: Option {q.correctAnswer}</p>
                    </div>
                    <button onClick={() => removeQuestion(q.id)} className="text-gray-400 hover:text-red-500 transition-colors h-fit p-2">
                       <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-white overflow-hidden rounded-4xl border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-6 lg:p-8 mt-6">
            <h3 className="font-bold text-lg mb-4 flex justify-between items-center" style={{color: NAVY}}>
              Uploaded Courses
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{cbtTests.length} Courses</span>
            </h3>
            <div className="space-y-3">
              {loading ? (
                <ListSkeleton rows={4} />
              ) : cbtTests.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <BookOpen size={32} className="mx-auto mb-3" />
                  <p className="text-sm font-medium">No courses uploaded yet.</p>
                </div>
              ) : (
                cbtTests.map(test => (
                  <Link key={test.id} to={`/admin/cbt/${test.id}`} className="block p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm" style={{color: NAVY}}>
                        {test.course}
                        <span className={`text-[10px] ml-2 px-2 py-0.5 rounded-full ${test.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{test.status?.toUpperCase() || 'DRAFT'}</span>
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-gray-500">{test.timeLapsMinutes} mins</span>
                        <button onClick={(e) => toggleStatus(e, test.id, test.status || 'draft')} className="text-gray-400 hover:text-teal-600 transition-colors p-1" title={test.status === 'published' ? 'Move to Draft' : 'Publish Exam'}>
                          <Save size={14} /> 
                        </button>
                        <button onClick={(e) => deleteCBT(e, test.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}
