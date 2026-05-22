'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addMinutes } from 'date-fns'
import { 
  Bell, 
  Check, 
  Clock, 
  Focus, 
  MapPin, 
  Trash2,
  ChevronRight,
  Sparkles,
  AlarmClock,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Notification, SnoozeDuration } from '@/lib/types'

interface NotificationsScreenProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onClear: (id: string) => void
  onAction: (notification: Notification, action: string) => void
  onSnooze: (id: string, duration: SnoozeDuration) => void
  onOpenTask: (taskId: string) => void
  defaultSnoozeDuration: SnoozeDuration
}

export function NotificationsScreen({ 
  notifications, 
  onMarkRead, 
  onClear,
  onAction,
  onSnooze,
  onOpenTask,
  defaultSnoozeDuration
}: NotificationsScreenProps) {
  const [snoozePopupId, setSnoozePopupId] = useState<string | null>(null)
  
  const unreadNotifications = notifications.filter(n => !n.read && !n.snoozedUntil)
  const snoozedNotifications = notifications.filter(n => n.snoozedUntil && new Date(n.snoozedUntil) > new Date())
  const readNotifications = notifications.filter(n => n.read && !n.snoozedUntil)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-5 h-5 text-primary" />
      case 'focus':
        return <Focus className="w-5 h-5 text-accent" />
      case 'location':
        return <MapPin className="w-5 h-5 text-success" />
      case 'ai-suggestion':
        return <Sparkles className="w-5 h-5 text-warning" />
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  const handleSnoozeSelect = (id: string, duration: SnoozeDuration) => {
    onSnooze(id, duration)
    setSnoozePopupId(null)
  }

  const handleAction = (notification: Notification, action: string) => {
    if (action === 'snooze') {
      setSnoozePopupId(notification.id)
    } else if (action === 'open') {
      onOpenTask(notification.taskId)
    } else {
      onAction(notification, action)
    }
  }

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
        >
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadNotifications.length} unread
            {snoozedNotifications.length > 0 && ` • ${snoozedNotifications.length} snoozed`}
          </p>
        </motion.div>
      </div>

      <div className="px-6 space-y-6">
        {/* Unread */}
        {unreadNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => unreadNotifications.forEach(n => onMarkRead(n.id))}
              >
                Mark all read
              </Button>
            </div>

            <div className="space-y-3">
              {unreadNotifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onMarkRead={() => onMarkRead(notification.id)}
                  onClear={() => onClear(notification.id)}
                  onAction={(action) => handleAction(notification, action)}
                  showSnoozePopup={snoozePopupId === notification.id}
                  onSnoozeSelect={(duration) => handleSnoozeSelect(notification.id, duration)}
                  onCloseSnoozePopup={() => setSnoozePopupId(null)}
                  defaultSnoozeDuration={defaultSnoozeDuration}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Snoozed */}
        {snoozedNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlarmClock className="w-5 h-5 text-warning" />
              Snoozed
            </h2>
            <div className="space-y-3">
              {snoozedNotifications.map((notification, index) => (
                <SnoozedNotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onClear={() => onClear(notification.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Read */}
        {readNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-4">Earlier</h2>
            <div className="space-y-3">
              {readNotifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                  read
                  onMarkRead={() => onMarkRead(notification.id)}
                  onClear={() => onClear(notification.id)}
                  onAction={(action) => handleAction(notification, action)}
                  showSnoozePopup={snoozePopupId === notification.id}
                  onSnoozeSelect={(duration) => handleSnoozeSelect(notification.id, duration)}
                  onCloseSnoozePopup={() => setSnoozePopupId(null)}
                  defaultSnoozeDuration={defaultSnoozeDuration}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <motion.div
            className="glass rounded-3xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground text-sm">
              {"You don't have any notifications right now"}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

interface NotificationCardProps {
  notification: Notification
  index: number
  read?: boolean
  onMarkRead: () => void
  onClear: () => void
  onAction: (action: string) => void
  showSnoozePopup: boolean
  onSnoozeSelect: (duration: SnoozeDuration) => void
  onCloseSnoozePopup: () => void
  defaultSnoozeDuration: SnoozeDuration
}

function NotificationCard({ 
  notification, 
  index, 
  read,
  onMarkRead, 
  onClear,
  onAction,
  showSnoozePopup,
  onSnoozeSelect,
  onCloseSnoozePopup,
  defaultSnoozeDuration
}: NotificationCardProps) {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-5 h-5 text-primary" />
      case 'focus':
        return <Focus className="w-5 h-5 text-accent" />
      case 'location':
        return <MapPin className="w-5 h-5 text-success" />
      case 'ai-suggestion':
        return <Sparkles className="w-5 h-5 text-warning" />
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  return (
    <motion.div
      className={`glass rounded-2xl p-4 relative ${!read ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          notification.type === 'reminder' ? 'bg-primary/10' :
          notification.type === 'focus' ? 'bg-accent/10' :
          notification.type === 'location' ? 'bg-success/10' :
          'bg-warning/10'
        }`}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm">{notification.title}</h3>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {format(new Date(notification.time), 'h:mm a')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {notification.actions.map((action) => (
                <Button
                  key={action.action}
                  size="sm"
                  variant={action.action === 'mark-done' ? 'default' : 'outline'}
                  className="rounded-xl h-8"
                  onClick={() => onAction(action.action)}
                >
                  {action.action === 'mark-done' && <Check className="w-3 h-3 mr-1" />}
                  {action.action === 'focus-mode' && <Focus className="w-3 h-3 mr-1" />}
                  {action.action === 'snooze' && <AlarmClock className="w-3 h-3 mr-1" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Clear button */}
        <motion.button
          onClick={onClear}
          className="p-2 -mr-2 -mt-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Snooze Popup */}
      <AnimatePresence>
        {showSnoozePopup && (
          <motion.div
            className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl p-4 flex flex-col justify-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center gap-2">
                <AlarmClock className="w-4 h-4 text-warning" />
                Snooze for
              </h4>
              <motion.button
                onClick={onCloseSnoozePopup}
                className="p-1 rounded-full hover:bg-muted/50"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([5, 10, 30, 60] as SnoozeDuration[]).map((duration) => (
                <motion.button
                  key={duration}
                  onClick={() => onSnoozeSelect(duration)}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                    duration === defaultSnoozeDuration
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {duration === 60 ? '1 hr' : `${duration}m`}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Will remind you at {format(addMinutes(new Date(), defaultSnoozeDuration), 'h:mm a')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface SnoozedNotificationCardProps {
  notification: Notification
  index: number
  onClear: () => void
}

function SnoozedNotificationCard({ notification, index, onClear }: SnoozedNotificationCardProps) {
  const snoozedUntil = notification.snoozedUntil ? new Date(notification.snoozedUntil) : new Date()
  
  return (
    <motion.div
      className="glass rounded-2xl p-4 bg-warning/5 border border-warning/20"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
          <AlarmClock className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">{notification.title}</h3>
          <p className="text-xs text-warning mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Snoozing until {format(snoozedUntil, 'h:mm a')}
          </p>
        </div>
        <motion.button
          onClick={onClear}
          className="p-2 -mr-2 -mt-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

// iPhone-style Push Notification
interface PushNotificationProps {
  notification: Notification
  onDismiss: () => void
  onAction: (action: string) => void
}

export function PushNotification({ notification, onDismiss, onAction }: PushNotificationProps) {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-4 h-4" />
      case 'focus':
        return <Focus className="w-4 h-4" />
      case 'location':
        return <MapPin className="w-4 h-4" />
      case 'ai-suggestion':
        return <Sparkles className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      className="fixed top-4 left-4 right-4 z-[100] safe-area-inset-top"
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -50) onDismiss()
      }}
    >
      <div className="glass-strong rounded-3xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                My Personal Diary
              </span>
              <span className="text-xs text-muted-foreground">now</span>
            </div>
            <h4 className="font-semibold text-sm mt-1">{notification.title}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
          </div>
          <motion.button
            onClick={onDismiss}
            className="p-1 rounded-full hover:bg-muted/50"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Quick Actions */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
            {notification.actions.slice(0, 3).map((action) => (
              <Button
                key={action.action}
                size="sm"
                variant={action.action === 'mark-done' ? 'default' : 'outline'}
                className="flex-1 rounded-xl h-9"
                onClick={() => onAction(action.action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Location Reminder Notification
interface LocationReminderProps {
  location: string
  taskTitle: string
  onDismiss: () => void
  onAction: () => void
}

export function LocationReminder({ location, taskTitle, onDismiss, onAction }: LocationReminderProps) {
  return (
    <motion.div
      className="fixed top-4 left-4 right-4 z-[100] safe-area-inset-top"
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
    >
      <div className="glass-strong rounded-3xl p-4 shadow-2xl bg-success/5 border border-success/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center text-white flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-success uppercase tracking-wide">Location Reminder</span>
            <h4 className="font-semibold text-sm mt-1">{"You're near"} {location}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">{taskTitle}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onDismiss}>
            Dismiss
          </Button>
          <Button className="flex-1 rounded-xl bg-success hover:bg-success/90" onClick={onAction}>
            Mark Done
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
