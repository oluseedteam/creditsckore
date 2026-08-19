import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, User as UserIcon, Save, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const NAVY = '#102A43', TEAL = '#066A6F'

export default function ProfileSettingsPage() {
  const { user, api, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [about, setAbout] = useState(user?.about || '')
  const [profilePic, setProfilePic] = useState(user?.profile_picture || null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image exceeds 2MB limit.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePic(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const tid = toast.loading('Saving profile...')
    try {
      await api.put('/user/profile', {
        name,
        about,
        profile_picture: profilePic
      })
      
      await refreshUser()
      toast.success('Profile updated successfully!', { id: tid })
    } catch (error) {
      toast.error('Failed to update profile.', { id: tid })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-teal-600 transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2" style={{color:NAVY}}>Profile Settings</h1>
        <p className="font-medium opacity-60" style={{color:NAVY}}>Manage your personal information and biography.</p>
      </div>

      <div className="card p-8 border-t-4" style={{borderTopColor: TEAL}}>
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 border-b border-gray-100 pb-8">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center relative">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={48} className="text-gray-300" />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white mb-1" size={24} />
                  <span className="text-xs font-bold text-white tracking-wider">CHANGE</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-display text-xl font-bold mb-2" style={{color: NAVY}}>Profile Picture</h3>
              <p className="text-sm text-gray-500 max-w-md">Upload a square image, ideally 500x500px or larger. Maximum file size is 2MB. JPG, PNG and WEBP formats are supported.</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 px-4 py-2 bg-gray-100 font-bold text-xs rounded-lg hover:bg-gray-200 transition-colors">
                Select New Image
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl text-md font-medium focus:ring-4 focus:ring-teal-500/10" placeholder="John Doe" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">About Me / Biography</label>
              <textarea value={about} onChange={e => setAbout(e.target.value)} rows="5"
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-md focus:ring-4 focus:ring-teal-500/10 resize-none" 
                placeholder="Tell us a bit about your journey to homeownership..."></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait" style={{background: TEAL}}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
