'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Eye, EyeOff, Check, X, ArrowLeft, Fingerprint, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AuthMode = 'login' | 'signup' | 'otp' | 'forgot-password'

interface AuthScreenProps {
  onComplete: () => void
}

interface ValidationState {
  minLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

export function AuthScreen({ onComplete }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)

  const validatePassword = useCallback((pass: string): ValidationState => ({
    minLength: pass.length >= 8,
    hasUppercase: /[A-Z]/.test(pass),
    hasNumber: /[0-9]/.test(pass),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
  }), [])

  const validation = validatePassword(password)
  const isPasswordValid = Object.values(validation).every(Boolean)
  const passwordsMatch = password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (mode === 'signup') {
      setMode('otp')
    } else if (mode === 'otp') {
      onComplete()
    } else {
      onComplete()
    }
    
    setIsLoading(false)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 py-12 safe-area-inset-top safe-area-inset-bottom">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {mode !== 'login' && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setMode(mode === 'otp' ? 'signup' : 'login')}
              className="p-2 rounded-full glass"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">My Personal Diary</span>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {mode === 'otp' ? (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-3xl font-bold mb-2">Verify your email</h1>
              <p className="text-muted-foreground mb-8">
                {"We've sent a 6-digit code to"} <span className="text-foreground font-medium">{email}</span>
              </p>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="flex gap-3 justify-center mb-8">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold glass border-border/50"
                    />
                  ))}
                </div>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="mb-8 text-primary"
                >
                  Resend code
                </Button>

                <div className="mt-auto">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg rounded-2xl"
                    disabled={otp.some(d => !d) || isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : mode === 'forgot-password' ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-3xl font-bold mb-2">Reset password</h1>
              <p className="text-muted-foreground mb-8">
                {"Enter your email and we'll send you a reset link"}
              </p>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-14 pl-12 glass border-border/50 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="mt-auto">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg rounded-2xl"
                    disabled={!email || isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-3xl font-bold mb-2">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-muted-foreground mb-8">
                {mode === 'login' 
                  ? 'Sign in to continue to your diary'
                  : 'Start your productivity journey'
                }
              </p>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-14 pl-12 glass border-border/50 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="h-14 pr-12 glass border-border/50 rounded-2xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className={`h-14 pr-12 glass border-border/50 rounded-2xl ${
                            confirmPassword && !passwordsMatch ? 'border-destructive' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {confirmPassword && !passwordsMatch && (
                        <p className="text-sm text-destructive">Passwords do not match</p>
                      )}
                    </div>

                    {/* Password requirements */}
                    <div className="glass rounded-2xl p-4 space-y-2">
                      <p className="text-sm font-medium mb-3">Password requirements:</p>
                      {[
                        { key: 'minLength', label: 'At least 8 characters' },
                        { key: 'hasUppercase', label: '1 uppercase letter' },
                        { key: 'hasNumber', label: '1 number' },
                        { key: 'hasSpecial', label: '1 special character' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          {validation[key as keyof ValidationState] ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className={`text-sm ${validation[key as keyof ValidationState] ? 'text-success' : 'text-muted-foreground'}`}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-primary text-sm font-medium self-end"
                  >
                    Forgot password?
                  </button>
                )}

                <div className="mt-auto space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg rounded-2xl"
                    disabled={(mode === 'signup' && (!isPasswordValid || !passwordsMatch)) || isLoading}
                  >
                    {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                  </Button>

                  {mode === 'login' && (
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full h-14 text-lg rounded-2xl glass"
                    >
                      <Fingerprint className="w-5 h-5 mr-2" />
                      Sign in with Face ID
                    </Button>
                  )}

                  <p className="text-center text-muted-foreground">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      type="button"
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-primary font-medium"
                    >
                      {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
