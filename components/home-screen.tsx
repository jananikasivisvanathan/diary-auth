'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  Trash2, 
  Pencil, 
  Check,
  Focus,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Task, Priority } from '@/lib/types'

interface HomeScreenProps {
  tasks: Task[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onCompleteTask: (id: string) => void
  onStartFocus: (taskId: string) => void
}

const priorityColors: Record<Priority, string> = {
  high: 'bg-priority-high text-white',
  medium: 'bg-priority-medium text-foreground',
  low: 'bg-priority-low text-white',
}

const priorityBorders: Record<Priority, string> = {
  high: 'border-l-priority-high',
  medium: 'border-l-priority-medium',
  low: 'border-l-priority-low',
}

export function HomeScreen({ 
  tasks, 
  onAddTask, 
  onEditTask, 
  onDeleteTask, 
  onCompleteTask,
  onStartFocus 
}: HomeScreenProps) {
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'
  
  const todayTasks = tasks.filter(t => {
    if (!t.date) return false
    const taskDate = new Date(t.date)
    return taskDate.toDateString() === now.toDateString() && t.status !== 'completed'
  })

  const upcomingTasks = tasks.filter(t => {
    if (!t.date) return false
    const taskDate = new Date(t.date)
    return taskDate > now && taskDate.toDateString() !== now.toDateString() && t.status !== 'completed'
  }).slice(0, 3)

  const completedToday = tasks.filter(t => {
    if (!t.date) return false
    const taskDate = new Date(t.date)
    return taskDate.toDateString() === now.toDateString() && t.status === 'completed'
  }).length

  const totalToday = todayTasks.length + completedToday
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <motion.div
      className="min-h-screen pb-24 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-6 safe-area-inset-top">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-muted-foreground text-sm">{format(now, 'EEEE, MMMM d')}</p>
          <h1 className="text-3xl font-bold mt-1">{greeting}</h1>
        </motion.div>
      </div>

      <div className="px-6 space-y-6">
        {/* Productivity Card */}
        <motion.div
          className="glass rounded-3xl p-5 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center justify-between relative">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                {"Today's Progress"}
              </div>
              <p className="text-4xl font-bold">{completionRate}%</p>
              <p className="text-sm text-muted-foreground mt-1">
                {completedToday} of {totalToday} tasks completed
              </p>
            </div>
            
            {/* Progress ring */}
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="text-primary"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - completionRate / 100) }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Suggestions */}
        {tasks.some(t => t.aiSuggested) && (
          <motion.div
            className="glass rounded-3xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <span className="font-medium">AI Suggestions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on your schedule, consider prioritizing your morning tasks first.
            </p>
          </motion.div>
        )}

        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{"Today's Tasks"}</h2>
            <span className="text-sm text-muted-foreground">{todayTasks.length} remaining</span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No tasks for today</p>
              <p className="text-sm text-muted-foreground mt-1">Tap + to add a new reminder</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  index={index}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onComplete={() => onCompleteTask(task.id)}
                  onFocus={() => onStartFocus(task.id)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming */}
        {upcomingTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming</h2>
              <button className="text-primary text-sm font-medium flex items-center gap-1">
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  index={index}
                  compact
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onComplete={() => onCompleteTask(task.id)}
                  onFocus={() => onStartFocus(task.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

interface TaskCardProps {
  task: Task
  index: number
  compact?: boolean
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
  onFocus: () => void
}

function TaskCard({ task, index, compact, onEdit, onDelete, onComplete, onFocus }: TaskCardProps) {
  return (
    <motion.div
      className={`glass rounded-2xl p-4 border-l-4 ${priorityBorders[task.priority || 'medium']}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      layout
    >
      <div className="flex items-start gap-3">
        {/* Complete button */}
        <motion.button
          onClick={onComplete}
          className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center flex-shrink-0 mt-0.5"
          whileTap={{ scale: 0.8 }}
        >
          {task.status === 'completed' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4 rounded-full bg-success flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
          
          {!compact && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {task.time && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {task.time}
                </div>
              )}
              {task.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {task.location}
                </div>
              )}
              {task.priority && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              )}
              {task.aiSuggested && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-accent/20 text-accent-foreground">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              )}
            </div>
          )}

          {compact && task.date && (
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(task.date), 'EEE, MMM d')}
              {task.time && ` at ${task.time}`}
            </p>
          )}
        </div>

        {/* Actions */}
        {!compact && (
          <div className="flex items-center gap-1">
            <motion.button
              onClick={onFocus}
              className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground"
              whileTap={{ scale: 0.9 }}
            >
              <Focus className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={onEdit}
              className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground"
              whileTap={{ scale: 0.9 }}
            >
              <Pencil className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={onDelete}
              className="p-2 rounded-xl hover:bg-destructive/10 text-destructive"
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
