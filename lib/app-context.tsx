'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Task, Notification, FocusSession, UserSettings, AppScreen } from './types'

interface AppContextType {
  // Navigation
  currentScreen: AppScreen
  setCurrentScreen: (screen: AppScreen) => void
  
  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  
  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  markNotificationRead: (id: string) => void
  clearNotification: (id: string) => void
  
  // Focus Mode
  focusSession: FocusSession | null
  startFocusSession: (mode: FocusSession['mode']) => void
  endFocusSession: () => void
  
  // Settings
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  
  // Theme
  isDarkMode: boolean
  toggleDarkMode: () => void
  
  // Onboarding
  onboardingComplete: boolean
  completeOnboarding: () => void
  
  // Auth
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
}

const defaultSettings: UserSettings = {
  appearance: 'system',
  notificationsEnabled: true,
  calendarSyncEnabled: false,
  locationEnabled: false,
  smartDetectionEnabled: false,
  focusWorkDuration: 25,
  focusBreakDuration: 5,
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash')
  const [tasks, setTasks] = useState<Task[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize dark mode based on system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (settings.appearance === 'system') {
        setIsDarkMode(e.matches)
      }
    }
    handleChange(mediaQuery)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings.appearance])

  // Apply dark mode class
  useEffect(() => {
    if (settings.appearance === 'dark' || (settings.appearance === 'system' && isDarkMode)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode, settings.appearance])

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
        // Create new recurring task
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

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
    }
    setNotifications(prev => [...prev, newNotification])
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const startFocusSession = useCallback((mode: FocusSession['mode']) => {
    const workDuration = mode === 'pomodoro' ? settings.focusWorkDuration : 60
    const breakDuration = mode === 'pomodoro' ? settings.focusBreakDuration : 0
    
    setFocusSession({
      mode,
      workDuration,
      breakDuration,
      isActive: true,
      currentPhase: 'work',
      timeRemaining: workDuration * 60,
    })
  }, [settings.focusWorkDuration, settings.focusBreakDuration])

  const endFocusSession = useCallback(() => {
    setFocusSession(null)
  }, [])

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const toggleDarkMode = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      appearance: prev.appearance === 'dark' ? 'light' : 'dark'
    }))
  }, [])

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true)
    setCurrentScreen('home')
  }, [])

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      notifications,
      addNotification,
      markNotificationRead,
      clearNotification,
      focusSession,
      startFocusSession,
      endFocusSession,
      settings,
      updateSettings,
      isDarkMode,
      toggleDarkMode,
      onboardingComplete,
      completeOnboarding,
      isAuthenticated,
      setIsAuthenticated,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
