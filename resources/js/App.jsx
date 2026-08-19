import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DialogProvider } from './context/DialogContext'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import DashboardPage from './pages/participant/DashboardPage'
import CreditScorePage from './pages/participant/CreditScorePage'
import ClassProgressPage from './pages/participant/ClassProgressPage'
import LoanGatewayPage from './pages/participant/LoanGatewayPage'
import QuizTestPage from './pages/participant/QuizTestPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminParticipantDetail from './pages/admin/AdminParticipantDetail'
import AdminCBTPage from './pages/admin/AdminCBTPage'
import AdminCBTDetailsPage from './pages/admin/AdminCBTDetailsPage'
import AdminCurriculumPage from './pages/admin/AdminCurriculumPage'
import AdminResultsPage from './pages/admin/AdminResultsPage'
import AdminMessagesPage from './pages/admin/AdminMessagesPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'
import ParticipantLayout from './components/layout/ParticipantLayout'
import AdminLayout from './components/layout/AdminLayout'
import ProfileSettingsPage from './pages/participant/ProfileSettingsPage'
import { PageLoader } from './components/ui/Loading'

function PrivateRoute({ children, requiredRole, loginPath = '/login' }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader label="Restoring session..." />
  if (!user) return <Navigate to={loginPath} replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

function ChatBotPopup() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-60 flex flex-col sm:w-[400px]">
          <div className="bg-teal-600 px-4 py-3 flex justify-between items-center text-white shadow-md z-10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse border border-teal-500"></div>
              <h3 className="font-semibold text-sm tracking-wide">AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-teal-700/80 p-1.5 rounded-full transition-colors flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
          </div>
          <iframe 
            src="https://n8n.srv1641217.hstgr.cloud/webhook/434de2ac-ecd6-4f47-a28a-a76678f77e04/chat" 
            className="w-full flex-1 border-0 bg-gray-50"
            title="Chat Bot"
            allow="microphone; camera; midi; encrypted-media;"
          />
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 rounded-full shadow-[0_0_15px_rgba(13,148,136,0.4)] flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-60 animate-bounce cursor-pointer border-none"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12"></path>
          ) : (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          )}
        </svg>
      </button>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DialogProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Participant Routes */}
            <Route element={<PrivateRoute requiredRole="participant"><ParticipantLayout /></PrivateRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/credit-score" element={<CreditScorePage />} />
              <Route path="/class-progress" element={<ClassProgressPage />} />
              <Route path="/loan-gateway" element={<LoanGatewayPage />} />
              <Route path="/quiz" element={<QuizTestPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute requiredRole="admin" loginPath="/admin/login"><AdminLayout /></PrivateRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="participant/:id" element={<AdminParticipantDetail />} />
              <Route path="cbt" element={<AdminCBTPage />} />
              <Route path="cbt/:id" element={<AdminCBTDetailsPage />} />
              <Route path="curriculum" element={<AdminCurriculumPage />} />
              <Route path="results" element={<AdminResultsPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ChatBotPopup />
      </DialogProvider>
    </AuthProvider>
  )
}
