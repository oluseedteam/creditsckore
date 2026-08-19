import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDialog } from '../../context/DialogContext'
import { Upload, Save, Trash2, CheckCircle, XCircle, FileText, Paperclip } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCurriculumQuery, useCbtTestsQuery } from '../../hooks/queries'
import { ListSkeleton, RefreshIndicator } from '../../components/ui/Loading'
import { invalidateCache } from '../../lib/queryCache'

const NAVY = '#102A43', TEAL = '#066A6F', PGREEN = '#2FBF71'

export default function AdminCurriculumPage() {
  const { api } = useAuth()
  const { showDialog } = useDialog()
  const { data: curriculums = [], loading, isRefreshing, refetch } = useCurriculumQuery()
  const { data: cbtTests = [] } = useCbtTestsQuery()
  const [editingId, setEditingId] = useState(null)
  
  const [currentC, setCurrentC] = useState({
    week: '',
    title: '',
    topicInput: '',
    topics: [],
    cbt_test_id: '',
    content: '',
    file: null
  })

  const fetchData = () => {
    invalidateCache('curriculum-frameworks')
    refetch().catch(() => toast.error('Failed to load curriculum data'))
  }

  const addTopic = () => {
    if (!currentC.topicInput.trim()) return
    setCurrentC({ ...currentC, topics: [...currentC.topics, currentC.topicInput.trim()], topicInput: '' })
  }

  const removeTopic = (index) => {
    setCurrentC({
      ...currentC,
      topics: currentC.topics.filter((_, i) => i !== index)
    })
  }

  const editModule = (curr) => {
    setEditingId(curr.id)
    setCurrentC({
      week: curr.week,
      title: curr.title,
      topicInput: '',
      topics: curr.topics || [],
      cbt_test_id: curr.cbt_test_id || '',
      content: curr.content || '',
      file: null
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveCurriculum = async () => {
    if (!currentC.week || !currentC.title) return toast.error('Week and Title are required')

    const formData = new FormData()
    formData.append('week', currentC.week)
    formData.append('title', currentC.title)
    formData.append('topics', JSON.stringify(currentC.topics))
    formData.append('cbt_test_id', currentC.cbt_test_id || '')
    formData.append('content', currentC.content || '')
    if (currentC.file) formData.append('file', currentC.file)
    
    if (editingId) {
      formData.append('_method', 'PATCH')
    }

    const loadId = toast.loading(editingId ? 'Updating module...' : 'Publishing module...')
    try {
      if (editingId) {
        await api.post(`/curriculum-frameworks/${editingId}`, formData)
      } else {
        await api.post('/curriculum-frameworks', formData)
      }
      toast.success(editingId ? 'Module updated!' : 'Module saved!', { id: loadId })
      setEditingId(null)
      setCurrentC({ week: '', title: '', topicInput: '', topics: [], cbt_test_id: '', content: '', file: null })
      invalidateCache('cbt-tests')
      fetchData()
    } catch { toast.error('Error saving module', { id: loadId }) }
  }

  const deleteCurriculum = (id) => {
    showDialog({
      title: 'Delete Module',
      message: 'Remove this curriculum module and all its attached resources?',
      confirmLabel: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        const lid = toast.loading('Deleting...')
        try {
          await api.delete(`/curriculum-frameworks/${id}`)
          toast.success('Module deleted', { id: lid })
          fetchData()
        } catch { toast.error('Error deleting', { id: lid }) }
      }
    })
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2 flex items-center gap-3" style={{color: NAVY}}>
          Curriculum Framework
          <RefreshIndicator show={isRefreshing} />
        </h1>
        <p className="font-medium opacity-60" style={{color: NAVY}}>Upload modules, link tests, and attach reading materials.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 border-t-4" style={{borderTopColor: editingId ? PGREEN : TEAL}}>
            <h3 className="font-bold text-lg mb-6" style={{color: NAVY}}>{editingId ? 'Edit Module' : 'New Module'}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Week</label>
                  <input type="number" value={currentC.week} onChange={e => setCurrentC({...currentC, week: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm" placeholder="1" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Title</label>
                  <input type="text" value={currentC.title} onChange={e => setCurrentC({...currentC, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm" placeholder="Module Title" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Topics (Add multiples)</label>
                <div className="flex gap-2">
                  <input type="text" value={currentC.topicInput} onChange={e => setCurrentC({...currentC, topicInput: e.target.value})}
                    className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl text-sm" placeholder="New Topic" 
                    onKeyPress={e => e.key === 'Enter' && addTopic()} />
                  <button onClick={addTopic} className="px-3 py-2 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition">Add</button>
                </div>
                {currentC.topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentC.topics.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                        {t} <XCircle className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTopic(i)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Reading Notes / Content</label>
                <textarea rows="4" value={currentC.content} onChange={e => setCurrentC({...currentC, content: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Type notes or educational content here..."></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Attach PDF Resource</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    <Paperclip className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 font-bold">{currentC.file ? currentC.file.name : editingId ? '(No new file selected)' : 'Select PDF or Document'}</p>
                  </div>
                  <input type="file" className="hidden" onChange={e => setCurrentC({...currentC, file: e.target.files[0]})} accept=".pdf,.doc,.docx" />
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Linked CBT Pool</label>
                <select value={currentC.cbt_test_id} onChange={e => setCurrentC({...currentC, cbt_test_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm">
                  <option value="">-- No Test Linked --</option>
                  {cbtTests.map(test => <option key={test.id} value={test.id}>{test.course}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <button onClick={saveCurriculum} disabled={!currentC.week || !currentC.title}
                className="w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{background: editingId ? PGREEN : TEAL}}>
                <Save size={18} /> {editingId ? 'Update Module' : 'Publish Module'}
              </button>
              {editingId && (
                <button onClick={() => { setEditingId(null); setCurrentC({ week: '', title: '', topicInput: '', topics: [], cbt_test_id: '', content: '', file: null }) }}
                  className="w-full py-2 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Existing Modules */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex justify-between items-center" style={{color: NAVY}}>
              Uploaded Curriculum
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{curriculums.length} Modules</span>
            </h3>
            <div className="space-y-3">
              {loading ? (
                <ListSkeleton rows={5} />
              ) : curriculums.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <Upload size={32} className="mx-auto mb-3" />
                  <p className="text-sm font-medium">No curriculum modules uploaded yet.</p>
                </div>
              ) : (
                curriculums.map((curr) => (
                  <div key={curr.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between gap-4 group transition-all hover:bg-white hover:shadow-md">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs bg-teal-600 text-white shadow-sm shrink-0">W{curr.week}</span>
                        <p className="font-bold text-sm md:text-md truncate" style={{color: NAVY}} title={curr.title}>{curr.title}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(curr.topics || []).slice(0, 5).map((t, idx) => (
                           <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-md font-bold uppercase tracking-tighter">{t}</span>
                        ))}
                        {(curr.topics || []).length > 5 && <span className="text-[10px] text-gray-400 font-bold">+{curr.topics.length - 5} MORE</span>}
                      </div>
                      {curr.cbtTest && (
                         <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100 mb-3">
                           <CheckCircle size={10} className="text-emerald-500" />
                           <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Linked: {curr.cbtTest.course}</p>
                         </div>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest">
                        {curr.content && (
                          <span className="flex items-center gap-1 text-teal-600">
                             <FileText size={12} /> Content Active
                          </span>
                        )}
                        {curr.file_path && (
                          <a href={`${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:8000'}/storage/${curr.file_path}`} 
                             target="_blank" rel="noreferrer"
                             className="flex items-center gap-1 text-orange-600 hover:underline">
                             <Paperclip size={12} /> PDF Asset Ready
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:flex-col md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 min-w-[80px]">
                      <button onClick={() => editModule(curr)} className="flex-1 md:flex-none p-2.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title="Edit Module">
                         <Save size={16} />
                      </button>
                      <button onClick={() => deleteCurriculum(curr.id)} className="flex-1 md:flex-none p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete Module">
                         <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
