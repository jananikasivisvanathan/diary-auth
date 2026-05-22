export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in-progress' | 'completed'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
export type NotificationStyle = 'banner' | 'alert' | 'silent'
export type FocusMode = 'standard' | 'pomodoro'
export type AppScreen = 'splash' | 'auth' | 'onboarding' | 'home' | 'calendar' | 'notifications' | 'settings'
export type SettingsSubScreen = 'main' | 'privacy-policy' | 'terms-of-service' | 'data-storage' | 'edit-profile' | 'change-password'
export type SnoozeDuration = 5 | 10 | 30 | 60
export type DefaultPriority = 'low' | 'medium' | 'high' | 'ai-decide'

export interface Task {
  id: string
  title: string
  description?: string
  date?: Date
  time?: string
  priority?: Priority
  status: TaskStatus
  recurrence: RecurrenceType
  notificationStyle: NotificationStyle
  location?: string
  locationEnabled?: boolean
  aiSuggested?: boolean
  // Pomodoro settings
  pomodoroEnabled?: boolean
  pomodoroWorkDuration?: number
  pomodoroBreakDuration?: number
  pomodoroCycles?: number
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  taskId: string
  title: string
  message: string
  time: Date
  read: boolean
  type: 'reminder' | 'focus' | 'location' | 'ai-suggestion'
  actions?: NotificationAction[]
  snoozedUntil?: Date
}

export interface NotificationAction {
  label: string
  action: 'mark-done' | 'snooze' | 'open' | 'focus-mode' | 'dismiss'
}

export interface FocusSession {
  mode: FocusMode
  workDuration: number // in minutes
  breakDuration: number // in minutes
  isActive: boolean
  currentPhase: 'work' | 'break'
  timeRemaining: number // in seconds
  currentCycle?: number
  totalCycles?: number
}

export interface UserSettings {
  appearance: 'light' | 'dark' | 'system'
  notificationsEnabled: boolean
  calendarSyncEnabled: boolean
  locationEnabled: boolean
  smartDetectionEnabled: boolean
  focusWorkDuration: number
  focusBreakDuration: number
  // New settings
  defaultSnoozeDuration: SnoozeDuration
  defaultNotificationPriority: DefaultPriority
  cloudSyncEnabled: boolean
  lastSyncedAt?: Date
  backupEnabled: boolean
}

export interface UserProfile {
  name: string
  email: string
  avatarUrl?: string
}

export interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: string
  action?: string
  enabled: boolean
}
