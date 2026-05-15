import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { notificationsAPI } from '@/api/endpoints'
import useAuthStore from '@/store/authStore'

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handle = () => { logout(); navigate('/login', { replace: true }) }
    window.addEventListener('auth:logout', handle)
    return () => window.removeEventListener('auth:logout', handle)
  }, [logout, navigate])

  const { data } = useQuery({
    queryKey: ['ref-unread-count'],
    queryFn: () => notificationsAPI.getUnreadCount().then(r => r.data),
    enabled: !!user,
    refetchInterval: user ? 30000 : false,
  })

  return (
    <header className="h-16 bg-white border-b border-navy-100 flex items-center px-4 sm:px-6 gap-4">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      {/* Notification bell */}
      {data?.unread_count > 0 && (
        <div className="relative p-2">
          <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {data.unread_count > 9 ? '9+' : data.unread_count}
          </span>
        </div>
      )}

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
        {user?.username?.[0]?.toUpperCase() || 'N'}
      </div>
      <span className="hidden sm:block text-sm font-medium text-navy-700">{user?.username}</span>
    </header>
  )
}