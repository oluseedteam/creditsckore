import { createContext, useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, HelpCircle, CheckCircle } from 'lucide-react'

const DialogContext = createContext()

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const showDialog = ({ title, message, type = 'alert', onConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        type,
        confirmLabel,
        cancelLabel,
        onConfirm: async () => {
          if (onConfirm) await onConfirm()
          setDialog(null)
          resolve(true)
        },
        onCancel: () => {
          setDialog(null)
          resolve(false)
        }
      })
    })
  }

  const getTheme = () => {
    switch (dialog?.type) {
      case 'danger': return { icon: <AlertCircle size={32} />, color: '#ef4444', bg: '#fef2f2' }
      case 'success': return { icon: <CheckCircle size={32} />, color: '#10b981', bg: '#ecfdf5' }
      case 'confirm': return { icon: <HelpCircle size={32} />, color: '#066A6F', bg: '#f0fdfa' }
      default: return { icon: <AlertCircle size={32} />, color: '#102A43', bg: '#f8fafc' }
    }
  }

  const theme = getTheme()

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}
      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={dialog.onCancel}
              className="absolute inset-0 bg-navy-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-sm rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-gray-100"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-transform hover:scale-110 duration-300"
                     style={{ backgroundColor: theme.bg, color: theme.color }}>
                  {theme.icon}
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2 font-display">{dialog.title}</h3>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">{dialog.message}</p>
              </div>
              <div className="flex flex-col gap-2 p-6 bg-gray-50/80">
                <button 
                  onClick={dialog.onConfirm}
                  className="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95"
                  style={{ backgroundColor: dialog.type === 'danger' ? '#ef4444' : '#102A43' }}
                >
                  {dialog.type === 'alert' ? 'Got it' : dialog.confirmLabel}
                </button>
                {(dialog.type === 'confirm' || dialog.type === 'danger') && (
                  <button 
                    onClick={dialog.onCancel}
                    className="w-full py-3 rounded-2xl font-bold text-gray-500 hover:text-gray-700 transition-all text-sm"
                  >
                    {dialog.cancelLabel}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  )
}

export const useDialog = () => useContext(DialogContext)
