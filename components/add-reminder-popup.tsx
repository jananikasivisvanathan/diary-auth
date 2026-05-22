'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Bell, 
  Repeat,
  AlertCircle,
  Timer,
  Coffee,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Task, Priority, RecurrenceType, NotificationStyle } from '@/lib/types'

interface AddReminderPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  editTask?: Task | null
  defaultDate?: Date
}

const examplePrompts = [
  "Submit assignment tomorrow 8 PM",
  "Buy groceries near Tesco",
  "Call mom every Sunday at 10 AM",
  "Team meeting next Monday 2 PM",
]

interface AISuggestion {
  date?: Date
  time?: string
  recurrence?: RecurrenceType
  location?: string
  priority?: Priority
  pomodoroWorkDuration?: number
  pomodoroBreakDuration?: number
  pomodoroCycles?: number
  aiReason?: string
}

export function AddReminderPopup({ isOpen, onClose, onSave, editTask, defaultDate }: AddReminderPopupProps) {
  const [step, setStep] = useState<'prompt' | 'form'>(editTask ? 'form' : 'prompt')
  const [prompt, setPrompt] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [priority, setPriority] = useState<Priority | undefined>(undefined)
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none')
  const [notificationStyle, setNotificationStyle] = useState<NotificationStyle>('banner')
  const [location, setLocation] = useState('')
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [aiAnalyzeEnabled, setAiAnalyzeEnabled] = useState(true)
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Pomodoro settings
  const [pomodoroEnabled, setPomodoroEnabled] = useState(false)
  const [pomodoroWorkDuration, setPomodoroWorkDuration] = useState(25)
  const [pomodoroBreakDuration, setPomodoroBreakDuration] = useState(5)
  const [pomodoroCycles, setPomodoroCycles] = useState(4)

  // Initialize form with edit task data
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title)
      setDate(editTask.date ? format(new Date(editTask.date), 'yyyy-MM-dd') : '')
      setTime(editTask.time || '')
      setPriority(editTask.priority)
      setRecurrence(editTask.recurrence)
      setNotificationStyle(editTask.notificationStyle)
      setLocation(editTask.location || '')
      setLocationEnabled(editTask.locationEnabled || false)
      setPomodoroEnabled(editTask.pomodoroEnabled || false)
      setPomodoroWorkDuration(editTask.pomodoroWorkDuration || 25)
      setPomodoroBreakDuration(editTask.pomodoroBreakDuration || 5)
      setPomodoroCycles(editTask.pomodoroCycles || 4)
      setStep('form')
    } else if (defaultDate) {
      setDate(format(defaultDate, 'yyyy-MM-dd'))
    }
  }, [editTask, defaultDate, isOpen])

  const analyzePrompt = useCallback(async (text: string) => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const suggestion: AISuggestion = {}
    const lowerText = text.toLowerCase()
    
    // Parse date
    if (lowerText.includes('tomorrow')) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      suggestion.date = tomorrow
    } else if (lowerText.includes('next monday')) {
      const today = new Date()
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7
      const nextMonday = new Date(today)
      nextMonday.setDate(today.getDate() + daysUntilMonday)
      suggestion.date = nextMonday
    } else if (lowerText.includes('today')) {
      suggestion.date = new Date()
    }
    
    // Parse time
    const timeMatch = text.match(/(\d{1,2})\s*(am|pm)/i)
    if (timeMatch) {
      let hour = parseInt(timeMatch[1])
      if (timeMatch[2].toLowerCase() === 'pm' && hour !== 12) hour += 12
      if (timeMatch[2].toLowerCase() === 'am' && hour === 12) hour = 0
      suggestion.time = `${hour.toString().padStart(2, '0')}:00`
    }
    
    // Parse recurrence
    if (lowerText.includes('every day') || lowerText.includes('daily')) {
      suggestion.recurrence = 'daily'
    } else if (lowerText.includes('every week') || lowerText.includes('weekly') || lowerText.includes('every sunday') || lowerText.includes('every monday')) {
      suggestion.recurrence = 'weekly'
    }
    
    // Parse location
    const locationMatch = text.match(/near\s+(\w+)/i)
    if (locationMatch) {
      suggestion.location = locationMatch[1]
    }
    
    // Suggest priority based on keywords
    if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('important')) {
      suggestion.priority = 'high'
    } else if (lowerText.includes('meeting') || lowerText.includes('submit') || lowerText.includes('deadline')) {
      suggestion.priority = 'high'
    } else if (lowerText.includes('call') || lowerText.includes('review')) {
      suggestion.priority = 'medium'
    }
    
    // AI-suggested Pomodoro based on task complexity
    const isLongTask = lowerText.includes('project') || lowerText.includes('report') || lowerText.includes('assignment') || lowerText.includes('review')
    const isQuickTask = lowerText.includes('call') || lowerText.includes('buy') || lowerText.includes('send')
    
    if (isLongTask) {
      suggestion.pomodoroWorkDuration = 45
      suggestion.pomodoroBreakDuration = 10
      suggestion.pomodoroCycles = 3
      suggestion.aiReason = 'This looks like a longer task. Suggested 45 min work blocks with 10 min breaks.'
    } else if (isQuickTask) {
      suggestion.pomodoroWorkDuration = 15
      suggestion.pomodoroBreakDuration = 5
      suggestion.pomodoroCycles = 1
      suggestion.aiReason = 'This seems like a quick task. Suggested 15 min focus session.'
    } else {
      suggestion.pomodoroWorkDuration = 25
      suggestion.pomodoroBreakDuration = 5
      suggestion.pomodoroCycles = 2
      suggestion.aiReason = 'Default Pomodoro: 25 min work, 5 min break.'
    }
    
    setAiSuggestion(suggestion)
    setTitle(text)
    if (suggestion.date) setDate(format(suggestion.date, 'yyyy-MM-dd'))
    if (suggestion.time) setTime(suggestion.time)
    if (suggestion.recurrence) setRecurrence(suggestion.recurrence)
    if (suggestion.location) {
      setLocation(suggestion.location)
      setLocationEnabled(true)
    }
    if (suggestion.pomodoroWorkDuration) {
      setPomodoroWorkDuration(suggestion.pomodoroWorkDuration)
      setPomodoroBreakDuration(suggestion.pomodoroBreakDuration || 5)
      setPomodoroCycles(suggestion.pomodoroCycles || 2)
    }
    // Don't auto-set priority - just suggest it
    
    setIsAnalyzing(false)
    setStep('form')
  }, [])

  const handlePromptSubmit = () => {
    if (prompt.trim()) {
      if (aiAnalyzeEnabled) {
        analyzePrompt(prompt)
      } else {
        setTitle(prompt)
        setStep('form')
      }
    }
  }

  const handleSave = () => {
    onSave({
      title,
      date: date ? new Date(date) : undefined,
      time,
      priority,
      status: 'pending',
      recurrence,
      notificationStyle,
      location: locationEnabled ? location : undefined,
      locationEnabled,
      aiSuggested: !!aiSuggestion,
      pomodoroEnabled,
      pomodoroWorkDuration: pomodoroEnabled ? pomodoroWorkDuration : undefined,
      pomodoroBreakDuration: pomodoroEnabled ? pomodoroBreakDuration : undefined,
      pomodoroCycles: pomodoroEnabled ? pomodoroCycles : undefined,
    })
    handleClose()
  }

  const handleClose = () => {
    setStep('prompt')
    setPrompt('')
    setTitle('')
    setDate('')
    setTime('')
    setPriority(undefined)
    setRecurrence('none')
    setNotificationStyle('banner')
    setLocation('')
    setLocationEnabled(false)
    setAiSuggestion(null)
    setAiAnalyzeEnabled(true)
    setPomodoroEnabled(false)
    setPomodoroWorkDuration(25)
    setPomodoroBreakDuration(5)
    setPomodoroCycles(4)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            className="fixed inset-x-4 bottom-4 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-md"
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="glass-strong rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editTask ? 'Edit Reminder' : step === 'prompt' ? 'New Reminder' : 'Set Details'}
                </h2>
                <motion.button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-muted/50"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {step === 'prompt' && !editTask ? (
                  <motion.div
                    key="prompt"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* AI Analyze Toggle */}
                    <div className="mb-4 p-4 glass rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <span className="font-medium">AI Analyze Mode</span>
                        </div>
                        <motion.button
                          onClick={() => setAiAnalyzeEnabled(!aiAnalyzeEnabled)}
                          className={`w-12 h-7 rounded-full p-1 transition-colors ${
                            aiAnalyzeEnabled ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <motion.div
                            className="w-5 h-5 rounded-full bg-white shadow-sm"
                            animate={{ x: aiAnalyzeEnabled ? 20 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>
                      {aiAnalyzeEnabled && (
                        <p className="text-xs text-muted-foreground mt-2">
                          AI will auto-fill date, time, priority, and suggest Pomodoro settings
                        </p>
                      )}
                    </div>

                    {/* Prompt Input */}
                    <div className="mb-4">
                      <Label className="flex items-center gap-2 mb-2">
                        What would you like to remember?
                      </Label>
                      <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type your reminder..."
                        className="h-14 rounded-2xl glass border-border/50"
                        onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
                      />
                    </div>

                    {/* Example prompts */}
                    <div className="mb-6">
                      <p className="text-xs text-muted-foreground mb-2">Try saying:</p>
                      <div className="flex flex-wrap gap-2">
                        {examplePrompts.map((example) => (
                          <motion.button
                            key={example}
                            onClick={() => setPrompt(example)}
                            className="px-3 py-1.5 rounded-full text-xs bg-muted/50 hover:bg-muted text-muted-foreground"
                            whileTap={{ scale: 0.95 }}
                          >
                            {example}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handlePromptSubmit}
                        className="flex-1 h-12 rounded-2xl"
                        disabled={!prompt.trim() || isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : aiAnalyzeEnabled ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze
                          </>
                        ) : (
                          'Continue'
                        )}
                      </Button>
                      <Button 
                        onClick={() => setStep('form')}
                        variant="outline"
                        className="h-12 rounded-2xl"
                      >
                        Manual
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* AI Suggestion Banner */}
                    {aiSuggestion && (
                      <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">AI Suggestions Applied</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Review and edit the details below. You can override any suggestion.
                        </p>
                        {aiSuggestion.aiReason && (
                          <p className="text-xs text-primary mt-2 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {aiSuggestion.aiReason}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Reminder title"
                        className="h-12 rounded-xl glass border-border/50"
                      />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date
                        </Label>
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="h-12 rounded-xl glass border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Time
                        </Label>
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="h-12 rounded-xl glass border-border/50"
                        />
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Priority
                        {aiSuggestion?.priority && !priority && (
                          <span className="text-xs text-primary">(AI suggests: {aiSuggestion.priority})</span>
                        )}
                      </Label>
                      <div className="flex gap-2">
                        {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                          <motion.button
                            key={p}
                            onClick={() => setPriority(priority === p ? undefined : p)}
                            className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-colors ${
                              priority === p
                                ? p === 'high' 
                                  ? 'bg-priority-high text-white'
                                  : p === 'medium'
                                  ? 'bg-priority-medium text-foreground'
                                  : 'bg-priority-low text-white'
                                : 'bg-muted/50 text-muted-foreground'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {p}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Recurrence */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Repeat className="w-4 h-4" />
                        Repeat
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map((r) => (
                          <motion.button
                            key={r}
                            onClick={() => setRecurrence(r)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                              recurrence === r
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 text-muted-foreground'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {r === 'none' ? 'Never' : r}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Pomodoro Settings */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Timer className="w-4 h-4" />
                          Pomodoro Timer
                        </Label>
                        <motion.button
                          onClick={() => setPomodoroEnabled(!pomodoroEnabled)}
                          className={`w-12 h-7 rounded-full p-1 transition-colors ${
                            pomodoroEnabled ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <motion.div
                            className="w-5 h-5 rounded-full bg-white shadow-sm"
                            animate={{ x: pomodoroEnabled ? 20 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>
                      
                      <AnimatePresence>
                        {pomodoroEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 pt-2"
                          >
                            {/* Work Duration */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> Work Duration
                                </span>
                                <span className="text-sm font-medium">{pomodoroWorkDuration} min</span>
                              </div>
                              <div className="flex gap-2">
                                {[15, 25, 45, 50].map((d) => (
                                  <motion.button
                                    key={d}
                                    onClick={() => setPomodoroWorkDuration(d)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                                      pomodoroWorkDuration === d
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted/50 text-muted-foreground'
                                    }`}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {d}m
                                  </motion.button>
                                ))}
                              </div>
                            </div>

                            {/* Break Duration */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Coffee className="w-3 h-3" /> Break Duration
                                </span>
                                <span className="text-sm font-medium">{pomodoroBreakDuration} min</span>
                              </div>
                              <div className="flex gap-2">
                                {[5, 10, 15].map((d) => (
                                  <motion.button
                                    key={d}
                                    onClick={() => setPomodoroBreakDuration(d)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                                      pomodoroBreakDuration === d
                                        ? 'bg-accent text-accent-foreground'
                                        : 'bg-muted/50 text-muted-foreground'
                                    }`}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {d}m
                                  </motion.button>
                                ))}
                              </div>
                            </div>

                            {/* Cycles */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Cycles</span>
                                <span className="text-sm font-medium">{pomodoroCycles}</span>
                              </div>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4].map((c) => (
                                  <motion.button
                                    key={c}
                                    onClick={() => setPomodoroCycles(c)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                                      pomodoroCycles === c
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted/50 text-muted-foreground'
                                    }`}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {c}x
                                  </motion.button>
                                ))}
                              </div>
                            </div>

                            {/* Summary */}
                            <div className="glass rounded-xl p-3 text-center">
                              <p className="text-xs text-muted-foreground">
                                Total focus time: <span className="font-medium text-foreground">{pomodoroWorkDuration * pomodoroCycles} min</span>
                                {' '}with{' '}
                                <span className="font-medium text-foreground">{pomodoroBreakDuration * (pomodoroCycles - 1)} min</span> breaks
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Notification Style */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notification
                      </Label>
                      <div className="flex gap-2">
                        {(['banner', 'alert', 'silent'] as NotificationStyle[]).map((n) => (
                          <motion.button
                            key={n}
                            onClick={() => setNotificationStyle(n)}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                              notificationStyle === n
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 text-muted-foreground'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {n}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location Reminder
                        </Label>
                        <motion.button
                          onClick={() => setLocationEnabled(!locationEnabled)}
                          className={`w-12 h-7 rounded-full p-1 transition-colors ${
                            locationEnabled ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <motion.div
                            className="w-5 h-5 rounded-full bg-white shadow-sm"
                            animate={{ x: locationEnabled ? 20 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>
                      <AnimatePresence>
                        {locationEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <Input
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="Enter location"
                              className="h-12 rounded-xl glass border-border/50"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={handleClose}
                        variant="outline"
                        className="flex-1 h-12 rounded-2xl"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        className="flex-1 h-12 rounded-2xl"
                        disabled={!title.trim()}
                      >
                        {editTask ? 'Update' : 'Save'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
