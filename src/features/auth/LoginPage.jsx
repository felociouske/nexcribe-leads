import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import { getErrorMessage } from '@/utils'
import Spinner from '@/components/ui/Spinner'

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [showPw, setShowPw] = useState(false)

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate('/wallet', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-navy-50/40">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-navy-900 text-lg leading-none">Nexcribe</p>
              <p className="text-teal-600 text-[11px] font-medium tracking-widest uppercase">Leads Portal</p>
            </div>
          </div>
          <h1 className="font-display font-bold text-2xl text-navy-900 mb-1">Sign in</h1>
          <p className="text-navy-500 text-sm">Access your referral earnings and wallet</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email" placeholder="you@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5">
              {isLoading ? <Spinner size="sm" /> : 'Log in'}
            </button>
          </form>

          <p className="text-center text-xs text-navy-400 mt-6">
            Use your Nexcribe account credentials.{' '}
            <a
              href={`${import.meta.env.VITE_MAIN_APP_URL || 'https://nexcribe.com'}/register`}
              className="text-teal-600 hover:text-teal-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              No account? Register →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}