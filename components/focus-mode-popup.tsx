'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Focus, Clock, Coffee, Zap, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FocusMode } from '@/lib/types'

interface FocusModePopupProps {
  isOpen: boolean
  onClose: () => void
  onStart: (mode: FocusMode, workDuration?: number, breakDuration?: number, cycles?: number) => void
  defaultWorkDuration?: number
  defaultBreakDuration?: number
}

export function FocusModePopup({ 
  isOpen, 
  onClose, 
  onStart,
  defaultWorkDuration = 25,
  defaultBreakDuration = 5
}: FocusModePopupProps) {
  const [selectedMode, setSelectedMode] = useState<FocusMode>('standard')
  const [workDuration, setWorkDuration] = useState(defaultWorkDuration)
  const [breakDuration, setBreakDuration] = useState(defaultBreakDuration)
  const [cycles, setCycles] = useState(4)
  const [showCustomize, setShowCustomize] = useState(false)

  const handleStart = () => {
    onStart(selectedMode, workDuration, breakDuration, cycles)
    onClose()
  }

  const presets = [
    { work: 15, break: 5, label: '15/5' },
    { work: 25, break: 5, label: '25/5' },
    { work: 45, break: 10, label: '45/10' },
    { work: 50, break: 15, label: '50/15' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-x-4 bottom-4 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-md"
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="glass-strong rounded-3xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Focus className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Focus Mode</h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted/50"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Mode Selection */}
              <div className="space-y-3 mb-6">
                {/* Standard Mode */}
                <motion.button
                  onClick={() => setSelectedMode('standard')}
                  className={`w-full p-4 rounded-2xl text-left transition-all ${
                    selectedMode === 'standard'
                      ? 'glass ring-2 ring-primary bg-primary/5'
                      : 'glass hover:bg-muted/30'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedMode === 'standard' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                    }`}>
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Standard</h3>
                      <p className="text-sm text-muted-foreground">
                        Blocks distractions until you complete your task
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Pomodoro Mode */}
                <motion.button
                  onClick={() => setSelectedMode('pomodoro')}
                  className={`w-full p-4 rounded-2xl text-left transition-all ${
                    selectedMode === 'pomodoro'
                      ? 'glass ring-2 ring-primary bg-primary/5'
                      : 'glass hover:bg-muted/30'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedMode === 'pomodoro' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                    }`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Pomodoro</h3>
                        <span className="text-xs text-muted-foreground">
                          {workDuration}m work / {breakDuration}m break
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Work in focused cycles with scheduled breaks
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Pomodoro Customization */}
              {selectedMode === 'pomodoro' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Duration Presets</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomize(!showCustomize)}
                      className="text-primary"
                    >
                      <Settings2 className="w-4 h-4 mr-1" />
                      {showCustomize ? 'Hide' : 'Customize'}
                    </Button>
                  </div>

                  {/* Presets */}
                  <div className="flex gap-2 mb-4">
                    {presets.map((preset) => (
                      <motion.button
                        key={preset.label}
                        onClick={() => {
                          setWorkDuration(preset.work)
                          setBreakDuration(preset.break)
                        }}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                          workDuration === preset.work && breakDuration === preset.break
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {preset.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Custom inputs */}
                  <AnimatePresence>
                    {showCustomize && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Work (min)
                          </Label>
                          <Input
                            type="number"
                            value={workDuration}
                            onChange={(e) => setWorkDuration(parseInt(e.target.value) || 15)}
                            min={5}
                            max={120}
                            className="h-12 rounded-xl glass border-border/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Coffee className="w-4 h-4" />
                            Break (min)
                          </Label>
                          <Input
                            type="number"
                            value={breakDuration}
                            onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                            min={1}
                            max={30}
                            className="h-12 rounded-xl glass border-border/50"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Start Button */}
              <Button 
                onClick={handleStart}
                className="w-full h-14 text-lg rounded-2xl"
              >
                <Focus className="w-5 h-5 mr-2" />
                Start Focus Session
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Focus Active Banner
interface FocusActiveBannerProps {
  mode: FocusMode
  phase: 'work' | 'break'
  timeRemaining: number
  onEnd: () => void
  currentCycle?: number
  totalCycles?: number
}

export function FocusActiveBanner({ mode, phase, timeRemaining, onEnd, currentCycle, totalCycles }: FocusActiveBannerProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 safe-area-inset-top"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
    >
      <div className={`mx-4 mt-4 glass-strong rounded-2xl p-4 ${
        phase === 'break' ? 'bg-success/10' : 'bg-primary/10'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              phase === 'break' ? 'bg-success text-white' : 'bg-primary text-primary-foreground'
            }`}>
              {phase === 'break' ? <Coffee className="w-5 h-5" /> : <Focus className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-semibold text-sm">
                {phase === 'break' ? 'Break Time' : 'Focus Session Active'}
              </p>
              <p className="text-xs text-muted-foreground">
                {mode === 'pomodoro' ? (
                  <>Pomodoro {currentCycle && totalCycles ? `${currentCycle}/${totalCycles}` : ''}</>
                ) : (
                  'Standard Mode'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEnd}
              className="text-muted-foreground"
            >
              End
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
