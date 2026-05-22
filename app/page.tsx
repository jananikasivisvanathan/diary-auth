'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { addMinutes } from 'date-fns'
import { SplashScreen } from '@/components/splash-screen'
import { AuthScreen } from '@/components/auth-screen'
import { OnboardingScreen } from '@/components/onboarding-screen'
import { HomeScreen } from '@/components/home-screen'
import { CalendarScreen } from '@/components/calendar-screen'
import { NotificationsScreen, PushNotification } from '@/components/notifications-screen'
import { SettingsScreen } from '@/components/settings-screen'
import { BottomNavigation } from '@/components/bottom-navigation'
import { AddReminderPopup } from '@/components/add-reminder-popup'
import { SmartMessagePopup } from '@/components/smart-message-popup'
import { FocusModePopup, FocusActiveBanner } from '@/components/focus-mode-popup'
import type { Task, Notification, FocusSession, UserSettings, AppScreen, FocusMode, UserProfile, SnoozeDuration } from '@/lib/types'

// Sample tasks for demo
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Review project proposal',
    date: new Date(),
    time: '09:00',
    priority: 'high',
    status: 'pending',
    recurrence: 'none',
    notificationStyle: 'banner',
    pomodoroEnabled: true,
    pomodoroWorkDuration: 45,
    pomodoroBreakDuration: 10,
    pomodoroCycles: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Team standup meeting',
    date: new Date(),
    time: '10:30',
    priority: 'medium',
    status: 'pending',
    recurrence: 'daily',
    notificationStyle: 'alert',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Submit weekly report',
    date: new Date(),
    time: '17:00',
    priority: 'high',
    status: 'pending',
    recurrence: 'weekly',
    notificationStyle: 'banner',
    aiSuggested: true,
    pomodoroEnabled: true,
    pomodoroWorkDuration: 25,
    pomodoroBreakDuration: 5,
    pomodoroCycles: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Buy groceries',
    date: new Date(Date.now() + 86400000),
    time: '18:00',
    status: 'pending',
    recurrence: 'none',
    notificationStyle: 'banner',
    location: 'Tesco',
    locationEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const sampleNotifications: Notification[] = [
  {
    id: '1',
    taskId: '1',
    title: 'Project proposal due soon',
    message: 'Review the project proposal in 1 hour',
    time: new Date(),
    read: false,
    type: 'reminder',
    actions: [
      { label: 'Mark Done', action: 'mark-done' },
      { label: 'Snooze', action: 'snooze' },
      { label: 'Focus', action: 'focus-mode' },
    ],
  },
  {
    id: '2',
    taskId: '2',
    title: 'Standup starting',
    message: 'Team standup meeting in 15 minutes',
    time: new Date(Date.now() - 3600000),
    read: false,
    type: 'reminder',
    actions: [
      { label: 'Open', action: 'open' },
      { label: 'Snooze', action: 'snooze' },
      { label: 'Dismiss', action: 'dismiss' },
    ],
  },
  {
    id: '3',
    taskId: '3',
    title: 'AI Suggestion',
    message: 'Based on your schedule, you might want to start the weekly report now',
    time: new Date(Date.now() - 7200000),
    read: true,
    type: 'ai-suggestion',
    actions: [
      { label: 'Start Focus', action: 'focus-mode' },
      { label: 'Dismiss', action: 'dismiss' },
    ],
  },
]

export default function DiaryApp() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash')
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null)
  const [settings, setSettings] = useState<UserSettings>({
    appearance: 'system',
    notificationsEnabled: true,
    calendarSyncEnabled: false,
    locationEnabled: true,
    smartDetectionEnabled: true,
    focusWorkDuration: 25,
    focusBreakDuration: 5,
    defaultSnoozeDuration: 10,
    defaultNotificationPriority: 'ai-decide',
    cloudSyncEnabled: true,
    lastSyncedAt: new Date(),
    backupEnabled: true,
  })
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john@example.com',
  })
  
  // Popups
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [showSmartMessage, setShowSmartMessage] = useState(false)
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activePushNotification, setActivePushNotification] = useState<Notification | null>(null)
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined)

  // Dark mode
  useEffect(() => {
    const updateDarkMode = () => {
      const isDark = 
        settings.appearance === 'dark' || 
        (settings.appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    updateDarkMode()
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateDarkMode)
    return () => mediaQuery.removeEventListener('change', updateDarkMode)
  }, [settings.appearance])

  // Focus session timer
  useEffect(() => {
    if (!focusSession?.isActive) return
    
    const timer = setInterval(() => {
      setFocusSession(prev => {
        if (!prev) return null
        
        const newTimeRemaining = prev.timeRemaining - 1
        
        if (newTimeRemaining <= 0) {
          // Switch phases or end session
          if (prev.mode === 'pomodoro') {
            if (prev.currentPhase === 'work') {
              return {
                ...prev,
                currentPhase: 'break',
                timeRemaining: prev.breakDuration * 60,
              }
            } else {
              const nextCycle = (prev.currentCycle || 1) + 1
              if (prev.totalCycles && nextCycle > prev.totalCycles) {
                return null // End session after all cycles
              }
              return {
                ...prev,
                currentPhase: 'work',
                timeRemaining: prev.workDuration * 60,
                currentCycle: nextCycle,
              }
            }
          }
          return null
        }
        
        return { ...prev, timeRemaining: newTimeRemaining }
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [focusSession?.isActive])

  // Task handlers
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks(prev => [...prev, newTask])
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
    ))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }, [])

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task
      
      if (task.recurrence !== 'none' && task.date) {
        const newDate = new Date(task.date)
        switch (task.recurrence) {
          case 'daily':
            newDate.setDate(newDate.getDate() + 1)
            break
          case 'weekly':
            newDate.setDate(newDate.getDate() + 7)
            break
          case 'monthly':
            newDate.setMonth(newDate.getMonth() + 1)
            break
          case 'yearly':
            newDate.setFullYear(newDate.getFullYear() + 1)
            break
        }
        return { ...task, date: newDate, status: 'pending' as const, updatedAt: new Date() }
      }
      
      return { ...task, status: 'completed' as const, updatedAt: new Date() }
    }))
  }, [])

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task)
    setShowAddReminder(true)
  }, [])

  const handleSaveTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData)
      setEditingTask(null)
    } else {
      addTask(taskData)
    }
    setDefaultDate(undefined)
  }, [editingTask, updateTask, addTask])

  const handleAddTaskWithDate = useCallback((date: Date) => {
    setDefaultDate(date)
    setShowAddReminder(true)
  }, [])

  const handleStartFocus = useCallback((mode: FocusMode, workDuration = 25, breakDuration = 5, cycles = 4) => {
    setFocusSession({
      mode,
      workDuration,
      breakDuration,
      isActive: true,
      currentPhase: 'work',
      timeRemaining: workDuration * 60,
      currentCycle: 1,
      totalCycles: mode === 'pomodoro' ? cycles : undefined,
    })
  }, [])

  const handleStartFocusForTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task?.pomodoroEnabled) {
      handleStartFocus(
        'pomodoro',
        task.pomodoroWorkDuration || 25,
        task.pomodoroBreakDuration || 5,
        task.pomodoroCycles || 4
      )
    } else {
      setShowFocusMode(true)
    }
  }, [tasks, handleStartFocus])

  // Navigation handler for screens
  const handleNavigate = useCallback((screen: AppScreen) => {
    setCurrentScreen(screen)
  }, [])

  // Notification handlers
  const handleMarkNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }, [])

  const handleClearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const handleSnoozeNotification = useCallback((id: string, duration: SnoozeDuration) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, snoozedUntil: addMinutes(new Date(), duration), read: true } : n
    ))
  }, [])

  const handleOpenTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      handleEditTask(task)
    }
  }, [tasks, handleEditTask])

  const handleNotificationAction = useCallback((notification: Notification, action: string) => {
    if (action === 'mark-done') {
      completeTask(notification.taskId)
      handleClearNotification(notification.id)
    } else if (action === 'focus-mode') {
      handleStartFocusForTask(notification.taskId)
      handleMarkNotificationRead(notification.id)
    } else if (action === 'dismiss') {
      handleClearNotification(notification.id)
    } else if (action === 'open') {
      handleOpenTask(notification.taskId)
      handleMarkNotificationRead(notification.id)
    }
    setActivePushNotification(null)
  }, [completeTask, handleClearNotification, handleMarkNotificationRead, handleStartFocusForTask, handleOpenTask])

  const handleUpdateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const handleUpdateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }, [])

  const handleDeleteAccount = useCallback(() => {
    // Reset to initial state
    setCurrentScreen('auth')
    setTasks([])
    setNotifications([])
  }, [])

  // Render main content based on current screen
  const renderMainContent = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            tasks={tasks}
            onAddTask={() => setShowAddReminder(true)}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onCompleteTask={completeTask}
            onStartFocus={handleStartFocusForTask}
          />
        )
      case 'calendar':
        return (
          <CalendarScreen
            tasks={tasks}
            onAddTask={handleAddTaskWithDate}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onStartFocus={handleStartFocusForTask}
          />
        )
      case 'notifications':
        return (
          <NotificationsScreen
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onClear={handleClearNotification}
            onAction={handleNotificationAction}
            onSnooze={handleSnoozeNotification}
            onOpenTask={handleOpenTask}
            defaultSnoozeDuration={settings.defaultSnoozeDuration}
          />
        )
      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onLogout={() => setCurrentScreen('auth')}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onDeleteAccount={handleDeleteAccount}
          />
        )
      default:
        return null
    }
  }

  const unreadNotificationCount = notifications.filter(n => !n.read && !n.snoozedUntil).length

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {currentScreen === 'splash' && (
          <SplashScreen 
            key="splash" 
            onComplete={() => setCurrentScreen('auth')} 
          />
        )}

        {currentScreen === 'auth' && (
          <AuthScreen 
            key="auth" 
            onComplete={() => setCurrentScreen('onboarding')} 
          />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen 
            key="onboarding" 
            onComplete={() => setCurrentScreen('home')} 
          />
        )}

        {['home', 'calendar', 'notifications', 'settings'].includes(currentScreen) && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderMainContent()}
            <BottomNavigation
              currentScreen={currentScreen}
              onNavigate={handleNavigate}
              notificationCount={unreadNotificationCount}
              onAddTask={() => setShowAddReminder(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popups */}
      <AddReminderPopup
        isOpen={showAddReminder}
        onClose={() => {
          setShowAddReminder(false)
          setEditingTask(null)
          setDefaultDate(undefined)
        }}
        onSave={handleSaveTask}
        editTask={editingTask}
        defaultDate={defaultDate}
      />

      <SmartMessagePopup
        isOpen={showSmartMessage}
        onClose={() => setShowSmartMessage(false)}
        onCreateReminder={(text) => {
          setShowSmartMessage(false)
          setShowAddReminder(true)
        }}
      />

      <FocusModePopup
        isOpen={showFocusMode}
        onClose={() => setShowFocusMode(false)}
        onStart={handleStartFocus}
        defaultWorkDuration={settings.focusWorkDuration}
        defaultBreakDuration={settings.focusBreakDuration}
      />

      {/* Focus Active Banner */}
      <AnimatePresence>
        {focusSession?.isActive && (
          <FocusActiveBanner
            mode={focusSession.mode}
            phase={focusSession.currentPhase}
            timeRemaining={focusSession.timeRemaining}
            onEnd={() => setFocusSession(null)}
            currentCycle={focusSession.currentCycle}
            totalCycles={focusSession.totalCycles}
          />
        )}
      </AnimatePresence>

      {/* Push Notification */}
      <AnimatePresence>
        {activePushNotification && (
          <PushNotification
            notification={activePushNotification}
            onDismiss={() => setActivePushNotification(null)}
            onAction={(action) => handleNotificationAction(activePushNotification, action)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
