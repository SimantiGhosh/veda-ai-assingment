"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '../lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.login(username.trim(), password)
      router.replace('/home')
    } catch (err) {
      setError((err as Error).message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-[#eeeeee] to-[#dadada] p-4 font-[var(--font-bricolage)]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-[420px] rounded-3xl bg-white p-8 shadow-[0px_32px_48px_rgba(0,0,0,0.10)]"
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-[0px_8px_16px_rgba(0,0,0,0.15)]">
            <img src="/icons/vedalogo.png" alt="VedaAI" className="h-full w-full object-cover" />
          </div>
          <span className="text-[22px] font-bold text-[#303030]">VedaAI</span>
        </div>

        {/* Heading */}
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-[24px] font-bold leading-tight text-[#303030]">Welcome back</h1>
          <p className="text-[14px] text-[#5d5d5d]/70">Sign in to continue to your assignments</p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#303030]">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your username"
              className="h-11 w-full rounded-full border border-[#DADADA] bg-[#f9f9f9] px-4 text-[14px] text-[#303030] placeholder:text-[#A9A9A9] focus:border-[#303030] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#303030]">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              className="h-11 w-full rounded-full border border-[#DADADA] bg-[#f9f9f9] px-4 text-[14px] text-[#303030] placeholder:text-[#A9A9A9] focus:border-[#303030] focus:outline-none"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[13px] font-medium text-[#C52828]"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            onClick={handleLogin}
            disabled={loading}
            className="mt-2 h-11 w-full rounded-full bg-[#181818] text-[15px] font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </motion.button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[13px] text-[#5d5d5d]/70">
          Don't have an account?{' '}
          <a href="/register" className="font-semibold text-[#303030] underline underline-offset-2">
            Register
          </a>
        </p>
      </motion.div>
    </div>
  )
}