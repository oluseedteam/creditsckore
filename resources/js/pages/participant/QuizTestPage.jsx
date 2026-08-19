import { useState, useEffect } from 'react'
import { useQuizCatalogQuery } from '../../hooks/queries'
import { CardGridSkeleton, PageLoader } from '../../components/ui/Loading'
import { invalidateCache } from '../../lib/queryCache'
import { useNavigate, useLocation } from 'react-router-dom'
import { Clock, CheckCircle, AlertTriangle, ChevronRight, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDialog } from '../../context/DialogContext'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// Theme Constants
const NAVY = '#102A43'
const TEAL = '#066A6F'
const PGREEN = '#2FBF71'
const CORAL = '#F56A6A'

export default function QuizTestPage() {
  const { api } = useAuth()
  const { showDialog } = useDialog()
  const navigate = useNavigate()
  const { data: testsList = [], loading: catalogLoading } = useQuizCatalogQuery()
  const [mockTest, setMockTest] = useState(null)
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [loadingTest, setLoadingTest] = useState(false)

  const location = useLocation()

  useEffect(() => {
    if (catalogLoading || !location.state?.autoStartId || mockTest) return
    selectTest(location.state.autoStartId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogLoading, location.state?.autoStartId])

  useEffect(() => {
    let timer;
    if (started && !completed && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            finishTest()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, completed, timeLeft])

  const finishTest = async () => {
    let finalScore = 0
    mockTest.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) finalScore++
    })
    setScore(finalScore)
    setCompleted(true)

    const tid = toast.loading('Saving results...')
    try {
      await api.post('/cbt-results', {
        cbt_test_id: mockTest.id,
        score: finalScore,
        total_questions: mockTest.questions.length,
        answers: answers
      })
      toast.success('Test results synchronized!', { id: tid })
      invalidateCache('cbt-results')
      invalidateCache('quiz-catalog')
    } catch {
      toast.error('Failed to sync results to server.', { id: tid })
    }
  }

  const handleSelect = (qId, optionKey) => {
    setAnswers({ ...answers, [qId]: optionKey })
  }

  const handleNext = () => {
    if (currentIdx < mockTest.questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      finishTest()
    }
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const selectTest = async (testId) => {
    const testInfo = testsList.find(t => t.id === testId);
    if (testInfo && (!testInfo.status || testInfo.status === 'draft')) {
       toast.error('exam is not ready');
       return;
    }
    if (testInfo && testInfo.alreadyTaken) {
       toast.error('You have already taken this exam');
       return;
    }
    
    try {
      setLoadingTest(true)
      const testData = await api.get('/cbt-tests/' + testId)
      const fixedOptionsTest = {
        ...testData.data,
        questions: testData.data.questions.map(q => ({
          id: q.id,
          text: q.text,
          options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
          correctAnswer: q.correct_answer
        }))
      }
      setMockTest(fixedOptionsTest)
      setTimeLeft(fixedOptionsTest.timeLapsMinutes * 60)
    } catch {
      showDialog({
        title: 'Error',
        message: 'Failed to load test. Please check your connection or try again later.',
        type: 'alert'
      })
    } finally {
      setLoadingTest(false)
    }
  }

  if (catalogLoading && !mockTest) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
        <PageLoader label="Loading assessments..." />
        <CardGridSkeleton count={3} />
      </div>
    )
  }

  if (loadingTest && !mockTest) {
    return <PageLoader label="Preparing exam..." />
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}} className="min-h-screen">
      <AnimatePresence mode='wait'>
        {!mockTest ? (
          <motion.div key="list" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
            {testsList.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center mt-20">
                <div className="card p-10 max-w-lg text-center space-y-6 shadow-2xl relative overflow-hidden" style={{background: '#f8fafc', border: '1px solid #e2e8f0'}}>
                  <AlertTriangle size={48} className="mx-auto text-amber-500" />
                  <h1 className="font-display text-2xl font-bold" style={{color: NAVY}}>No Tests Available</h1>
                  <p className="text-gray-500 font-medium">Currently, there are no CBT tests available. Please check back later.</p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="font-display text-4xl font-bold tracking-tight mb-2" style={{color: NAVY}}>Available Tests</h1>
                  <p className="font-medium opacity-60" style={{color: NAVY}}>Select a course to begin your Computer Based Test.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testsList.map(t => (
                    <motion.div whileHover={{y:-5}} key={t.id} className="card p-6 flex flex-col justify-between hover:shadow-xl transition-all border-t-4" style={{borderTopColor: TEAL}}>
                      <div>
                        <h3 className="font-bold text-xl mb-2" style={{color: NAVY}}>{t.course}</h3>
                        <div className="flex gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
                          <span className="flex items-center gap-1"><Clock size={14}/> {t.timeLapsMinutes} mins</span>
                          <span className="flex items-center gap-1"><CheckCircle size={14}/> {t.questions?.length || 0} Qs</span>
                        </div>
                      </div>
                      <button onClick={() => selectTest(t.id)} disabled={t.alreadyTaken} className={`w-full py-3 rounded-xl font-bold text-white transition ${t.alreadyTaken ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}>{t.alreadyTaken ? 'Already Taken' : 'Take Test'}</button>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        ) : completed ? (
          <motion.div key="completed" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="p-6 lg:p-10 max-w-3xl mx-auto text-center mt-10 print:mt-0 print:p-0">
            <div className="card p-10 space-y-6 inline-flex flex-col items-center shadow-xl border-t-8 print:shadow-none print:border-none print:bg-white" style={{borderColor: (score / mockTest.questions.length) >= 0.5 ? PGREEN : CORAL}}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg print:shadow-none" 
                   style={{background: (score / mockTest.questions.length) >= 0.5 ? `${PGREEN}15` : `${CORAL}15`, color: (score / mockTest.questions.length) >= 0.5 ? PGREEN : CORAL}}>
                {(score / mockTest.questions.length) >= 0.5 ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
              </div>
              <h1 className="font-display text-3xl font-bold" style={{color: NAVY}}>Test Result</h1>
              <p className="text-gray-500 font-medium pb-4 border-b w-full">Certificate of Completion: {mockTest.course}</p>
              <div className="text-center w-full py-6">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Final Achievement</p>
                <p className="text-7xl font-black" style={{color: (score / mockTest.questions.length) >= 0.5 ? PGREEN : CORAL}}>
                  {Math.round((score / mockTest.questions.length) * 100)}%
                </p>
                <p className="text-lg font-bold mt-2" style={{color: NAVY}}>{score} / {mockTest.questions.length} Correct</p>
              </div>
              
              <div className="flex gap-4 print:hidden">
                <button onClick={() => window.print()} className="px-8 py-3 rounded-xl font-bold border-2 border-gray-100 hover:border-teal-500 transition-all flex items-center gap-2">
                   Check Result & Download
                </button>
                <button onClick={() => navigate('/dashboard')} className="px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all relative overflow-hidden group" style={{background: NAVY}}>
                  <span className="relative z-10">Back to Dashboard</span>
                  <div className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100" style={{background: TEAL}}></div>
                </button>
              </div>

              <div className="hidden print:block text-xs text-gray-400 mt-20 pt-10 border-t w-full">
                This certificate verifies that the participant successfully completed the {mockTest.course} CBT.
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ) : !started ? (
          <motion.div key="intro" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="p-6 lg:p-10 max-w-4xl mx-auto h-full flex flex-col justify-center items-center mt-20">
            <div className="card p-10 max-w-lg text-center space-y-6 shadow-2xl relative overflow-hidden border-none" style={{background: NAVY}}>
               <div className="absolute inset-0 opacity-10" style={{background: 'radial-gradient(circle at 50% -20%, #2FBF71, transparent 70%)'}}></div>
               <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                     <Clock size={32} className="text-emerald-400" />
                  </div>
                  <h1 className="font-display text-3xl font-bold text-white mb-2">{mockTest.course}</h1>
                  <p className="text-gray-300 font-medium mb-8">This is a Computer Based Test. The questions will be displayed randomly. Once started, the timer cannot be paused.</p>
                  
                  <div className="flex bg-white/5 rounded-xl p-4 divide-x divide-white/10 mb-8 border border-white/10">
                     <div className="flex-1 px-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Time Lapse</p>
                        <p className="text-xl font-bold text-white">{mockTest.timeLapsMinutes} mins</p>
                     </div>
                     <div className="flex-1 px-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Questions</p>
                        <p className="text-xl font-bold text-white">{mockTest.questions.length}</p>
                     </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setMockTest(null)} 
                      className="py-4 px-6 rounded-xl font-bold text-lg text-white bg-white/10 hover:bg-white/20 transition-colors">
                      Cancel
                    </button>
                    <button onClick={() => setStarted(true)} 
                      className="flex-1 py-4 rounded-xl font-bold text-lg text-navy-900 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-900/50">
                      Start Test Now
                    </button>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="quiz" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="p-6 lg:p-10 max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h2 className="font-bold" style={{color: NAVY}}>{mockTest.course}</h2>
                <p className="text-xs font-medium text-gray-500">Question {currentIdx + 1} of {mockTest.questions.length}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg shadow-inner"
                   style={{background: timeLeft < 60 ? `${CORAL}15` : '#f8fafc', color: timeLeft < 60 ? CORAL : NAVY}}>
                <Clock size={16} />
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-teal-600" 
                   initial={{width: 0}} animate={{width: `${((currentIdx + 1) / mockTest.questions.length) * 100}%`}} transition={{duration: 0.3}}></motion.div>
            </div>

            <div className="card p-8 min-h-[400px] flex flex-col">
              <AnimatePresence mode='wait'>
                <motion.div key={currentIdx} initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} transition={{duration:0.2}}>
                  <h3 className="text-xl font-medium leading-relaxed mb-8" style={{color: NAVY}}>
                    {mockTest.questions[currentIdx].text}
                  </h3>

                  <div className="space-y-3">
                    {Object.entries(mockTest.questions[currentIdx].options).map(([key, value]) => {
                      const isSelected = answers[mockTest.questions[currentIdx].id] === key
                      return (
                        <button key={key} onClick={() => handleSelect(mockTest.questions[currentIdx].id, key)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                            isSelected ? 'border-teal-500 bg-teal-50/50' : 'border-gray-100 hover:border-teal-200 bg-white'
                          }`}>
                          <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                              isSelected ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-teal-100'
                            }`}>
                              {key}
                            </span>
                            <span className={`font-medium ${isSelected ? 'text-teal-900' : 'text-gray-700'}`}>{value}</span>
                          </div>
                          {isSelected && <Check size={20} className="text-teal-500" />}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-end mt-auto pt-6 border-t border-gray-100">
                <button onClick={handleNext} disabled={!answers[mockTest.questions[currentIdx].id]}
                  className="px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{background: TEAL}}>
                  {currentIdx === mockTest.questions.length - 1 ? 'Submit Test' : 'Next Question'} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
