import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'
import { cn } from '@/utils'

const NAV = [
  { to: '/wallet', icon: '◎', label: 'Wallet' },
  { to: '/leads',  icon: '◉', label: 'Leads' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out.')
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 bottom-0 md:sticky md:top-0 md:h-screen z-30 w-64 flex flex-col',
        'bg-navy-900 transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <div className="flex flex-col">
          <span className="font-display font-bold text-xl text-white tracking-tight leading-none">
            Nexcribe
          </span>
          <span className="text-teal-400 text-[10px] font-medium tracking-widest uppercase mt-1">
            Leads Portal
          </span>
        </div>
        <button onClick={onClose} className="ml-auto md:hidden text-white/50 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/wallet'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-teal-600 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}

        {/* Link back to main app */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <a
            href={import.meta.env.VITE_MAIN_APP_URL || 'https://nexcribe.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <span className="text-base w-5 text-center">↗</span>
            Main Platform
          </a>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3 pb-6 md:pb-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.username?.[0]?.toUpperCase() || 'N'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.username}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 text-sm transition-colors"
        >
          <span className="text-base w-5 text-center">⇤</span>
          Log out
        </button>
      </div>
    </aside>
  )
}