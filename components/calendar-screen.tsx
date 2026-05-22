'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  format, 
  addDays, 
  startOfWeek, 
  isSameDay, 
  isToday,
  addWeeks,
  subWeeks,
} from 'date-fns'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  Clock,
  AlertTriangle,
  Focus,
  Pencil,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Task, Priority } from '@/lib/types'

interface CalendarScreenProps {
  tasks: Task[]
  onAddTask: (date: Date) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onStartFocus: (taskId: string) => void
}

const priorityColors: Record<Priority, string> = {
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
}

export function CalendarScreen({ 
  tasks, 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  onStartFocus 
}: CalendarScreenProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [expandedTimeline, setExpandedTimeline] = useState(false)
  const [showConflictPopup, setShowConflictPopup] = useState(false)

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [currentWeek])

  const selectedDayTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.date) return false
      return isSameDay(new Date(t.date), selectedDate) && t.status !== 'completed'
    }).sort((a, b) => {
      if (!a.time || !b.time) return 0
      return a.time.localeCompare(b.time)
    })
  }, [tasks, selectedDate])

  const getTasksForDay = (date: Date) => {
    return tasks.filter(t => {
      if (!t.date) return false
      return isSameDay(new Date(t.date), date) && t.status !== 'completed'
    })
  }

  const getDayBusyness = (date: Date) => {
    const dayTasks = getTasksForDay(date)
    if (dayTasks.length === 0) return 'free'
    if (dayTasks.length >= 5) return 'busy'
    if (dayTasks.length >= 3) return 'moderate'
    return 'light'
  }

  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }, [])

  return (
    <motion.div
      className="min-h-screen pb-24 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-4 safe-area-inset-top">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground mt-1">{format(currentWeek, 'MMMM yyyy')}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="p-2 rounded-xl glass"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="p-2 rounded-xl glass"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Week Day Cards */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentDay = isToday(day)
            const busyness = getDayBusyness(day)
            const dayTasks = getTasksForDay(day)

            return (
              <motion.button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 w-16 py-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'glass'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={`text-xs font-medium ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {format(day, 'EEE')}
                </span>
                <span className={`text-xl font-bold ${isCurrentDay && !isSelected ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                {/* Busyness indicator */}
                <div className="flex gap-1 mt-1">
                  {dayTasks.slice(0, 3).map((task, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected 
                          ? 'bg-primary-foreground/70' 
                          : priorityColors[task.priority || 'medium']
                      }`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className={`text-[10px] ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
                
                {/* Free/Busy badge */}
                {busyness === 'free' && (
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-primary-foreground/70' : 'text-success'}`}>
                    Free
                  </span>
                )}
                {busyness === 'busy' && (
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-primary-foreground/70' : 'text-destructive'}`}>
                    Busy
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* AI Schedule Suggestion */}
      <div className="px-6 mb-6">
        <motion.div
          className="glass rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">AI Suggestion</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedDayTasks.length === 0 
              ? 'This day looks free! Perfect time to schedule important tasks.'
              : selectedDayTasks.length >= 5
              ? 'Busy day ahead! Consider moving some tasks to tomorrow.'
              : `You have ${selectedDayTasks.length} task${selectedDayTasks.length > 1 ? 's' : ''} scheduled. Room for more if needed.`
            }
          </p>
        </motion.div>
      </div>

      {/* Timeline */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{format(selectedDate, 'EEEE, MMMM d')}</h2>
          <Button
            onClick={() => setExpandedTimeline(!expandedTimeline)}
            variant="ghost"
            size="sm"
            className="text-primary"
          >
            {expandedTimeline ? 'Collapse' : 'Expand'}
          </Button>
        </div>

        <div className={`relative ${expandedTimeline ? 'max-h-none' : 'max-h-[400px]'} overflow-y-auto`}>
          <div className="space-y-1">
            {timeSlots.map((slot) => {
              const slotTasks = selectedDayTasks.filter(t => t.time?.startsWith(slot.split(':')[0]))
              const slotHour = parseInt(slot.split(':')[0])
              
              return (
                <motion.div
                  key={slot}
                  className="flex gap-4 min-h-[60px] group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {/* Time label */}
                  <div className="w-14 text-xs text-muted-foreground pt-1 flex-shrink-0">
                    {slot}
                  </div>

                  {/* Timeline content */}
                  <div className="flex-1 relative border-l border-border pl-4">
                    {/* Current time indicator */}
                    {isToday(selectedDate) && slotHour === new Date().getHours() && (
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    {slotTasks.length > 0 ? (
                      <div className="space-y-2">
                        {slotTasks.map((task) => (
                          <TaskBubble
                            key={task.id}
                            task={task}
                            onEdit={() => onEditTask(task)}
                            onDelete={() => onDeleteTask(task.id)}
                            onFocus={() => onStartFocus(task.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => onAddTask(selectedDate)}
                        className="w-full h-full min-h-[50px] rounded-xl border-2 border-dashed border-transparent group-hover:border-muted-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Conflict Popup */}
      <AnimatePresence>
        {showConflictPopup && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConflictPopup(false)}
            />
            <motion.div
              className="fixed inset-x-4 bottom-4 z-50 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
            >
              <div className="glass-strong rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-warning/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Schedule Conflict</h3>
                    <p className="text-sm text-muted-foreground">You already have a lecture at this time</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Would you like to move this task to 6 PM instead?
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowConflictPopup(false)}>
                    Keep
                  </Button>
                  <Button className="flex-1" onClick={() => setShowConflictPopup(false)}>
                    Move to 6 PM
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface TaskBubbleProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onFocus: () => void
}

function TaskBubble({ task, onEdit, onDelete, onFocus }: TaskBubbleProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      className={`glass rounded-2xl p-3 border-l-4 ${
        task.priority === 'high' 
          ? 'border-l-priority-high' 
          : task.priority === 'medium'
          ? 'border-l-priority-medium'
          : 'border-l-priority-low'
      }`}
      layout
      onClick={() => setShowActions(!showActions)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{task.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{task.time}</span>
          </div>
        </div>
        {task.priority && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${
            priorityColors[task.priority]
          }`}>
            {task.priority}
          </span>
        )}
      </div>

      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="flex gap-2 mt-3 pt-3 border-t border-border/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Button size="sm" variant="ghost" className="flex-1" onClick={onFocus}>
              <Focus className="w-4 h-4 mr-1" /> Focus
            </Button>
            <Button size="sm" variant="ghost" className="flex-1" onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="ghost" className="flex-1 text-destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
