'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  Calendar, 
  Focus, 
  Sparkles, 
  Shield, 
  User,
  ChevronRight,
  ChevronLeft,
  MapPin,
  LogOut,
  Trash2,
  Database,
  FileText,
  Scale,
  Camera,
  Eye,
  EyeOff,
  Cloud,
  Clock,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserSettings, SettingsSubScreen, UserProfile, SnoozeDuration, DefaultPriority } from '@/lib/types'

interface SettingsScreenProps {
  settings: UserSettings
  onUpdateSettings: (updates: Partial<UserSettings>) => void
  onLogout: () => void
  profile: UserProfile
  onUpdateProfile: (updates: Partial<UserProfile>) => void
  onDeleteAccount: () => void
}

export function SettingsScreen({ 
  settings, 
  onUpdateSettings, 
  onLogout,
  profile,
  onUpdateProfile,
  onDeleteAccount
}: SettingsScreenProps) {
  const [subScreen, setSubScreen] = useState<SettingsSubScreen>('main')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const appearanceOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ]

  if (subScreen !== 'main') {
    return (
      <SubScreen
        screen={subScreen}
        onBack={() => setSubScreen('main')}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        profile={profile}
        onUpdateProfile={onUpdateProfile}
      />
    )
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
          <h1 className="text-3xl font-bold">Settings</h1>
        </motion.div>
      </div>

      <div className="px-6 space-y-6">
        {/* Appearance */}
        <motion.div
          className="glass rounded-3xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary" />
            Appearance
          </h2>
          <div className="flex gap-2">
            {appearanceOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => onUpdateSettings({ appearance: option.value })}
                className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-2 transition-colors ${
                  settings.appearance === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <option.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{option.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          className="glass rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-5 border-b border-border/50">
            <h2 className="font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h2>
          </div>
          <SettingToggle
            label="Push Notifications"
            description="Receive reminders and alerts"
            enabled={settings.notificationsEnabled}
            onToggle={() => onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          />
          
          {/* Snooze Duration */}
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-medium">Default Snooze Duration</span>
            <div className="flex gap-2 mt-3">
              {([5, 10, 30, 60] as SnoozeDuration[]).map((duration) => (
                <motion.button
                  key={duration}
                  onClick={() => onUpdateSettings({ defaultSnoozeDuration: duration })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    settings.defaultSnoozeDuration === duration
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {duration === 60 ? '1 hr' : `${duration} min`}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Default Priority */}
          <div className="px-5 py-4 border-b border-border/50 last:border-b-0">
            <span className="font-medium">Default Notification Priority</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {(['low', 'medium', 'high', 'ai-decide'] as DefaultPriority[]).map((p) => (
                <motion.button
                  key={p}
                  onClick={() => onUpdateSettings({ defaultNotificationPriority: p })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                    settings.defaultNotificationPriority === p
                      ? p === 'high' 
                        ? 'bg-priority-high text-white'
                        : p === 'medium'
                        ? 'bg-priority-medium text-foreground'
                        : p === 'ai-decide'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-priority-low text-white'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {p === 'ai-decide' ? 'AI Decide' : p}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Calendar Sync */}
        <motion.div
          className="glass rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-5 border-b border-border/50">
            <h2 className="font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Calendar
            </h2>
          </div>
          <SettingToggle
            label="Google Calendar Sync"
            description="Sync events from your calendar"
            enabled={settings.calendarSyncEnabled}
            onToggle={() => onUpdateSettings({ calendarSyncEnabled: !settings.calendarSyncEnabled })}
          />
        </motion.div>

        {/* Location */}
        <motion.div
          className="glass rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="p-5 border-b border-border/50">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </h2>
          </div>
          <SettingToggle
            label="Location Reminders"
            description="Get notified near specific places"
            enabled={settings.locationEnabled}
            onToggle={() => onUpdateSettings({ locationEnabled: !settings.locationEnabled })}
          />
        </motion.div>

        {/* Focus Settings */}
        <motion.div
          className="glass rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-5 border-b border-border/50">
            <h2 className="font-semibold flex items-center gap-2">
              <Focus className="w-5 h-5 text-primary" />
              Focus Mode
            </h2>
          </div>
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-medium">Default Work Duration</span>
            <div className="flex gap-2 mt-3">
              {[15, 25, 45, 50].map((duration) => (
                <motion.button
                  key={duration}
                  onClick={() => onUpdateSettings({ focusWorkDuration: duration })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    settings.focusWorkDuration === duration
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {duration} min
                </motion.button>
              ))}
            </div>
          </div>
          <div className="px-5 py-4">
            <span className="font-medium">Default Break Duration</span>
            <div className="flex gap-2 mt-3">
              {[5, 10, 15].map((duration) => (
                <motion.button
                  key={duration}
                  onClick={() => onUpdateSettings({ focusBreakDuration: duration })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    settings.focusBreakDuration === duration
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {duration} min
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Features */}
        <motion.div
          className="glass rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="p-5 border-b border-border/50">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Features
            </h2>
          </div>
          <SettingToggle
            label="Smart Message Detection"
            description="Auto-detect dates from messages"
            enabled={settings.smartDetectionEnabled}
            onToggle={() => onUpdateSettings({ smartDetectionEnabled: !settings.smartDetectionEnabled })}
          />
        </motion.div>

        {/* Privacy */}
        <motion.div
          className="glass rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-5 border-b border-border/50">
            <h2 className="font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacy
            </h2>
          </div>
          <SettingLink label="Privacy Policy" icon={FileText} onClick={() => setSubScreen('privacy-policy')} />
          <SettingLink label="Terms of Service" icon={Scale} onClick={() => setSubScreen('terms-of-service')} />
          <SettingLink label="Data & Storage" icon={Database} onClick={() => setSubScreen('data-storage')} />
        </motion.div>

        {/* Account */}
        <motion.div
          className="glass rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="p-5 border-b border-border/50">
            <h2 className="font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account
            </h2>
          </div>
          <SettingLink label="Edit Profile" icon={User} onClick={() => setSubScreen('edit-profile')} />
          <SettingLink label="Change Password" icon={Shield} onClick={() => setSubScreen('change-password')} />
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full px-5 py-4 flex items-center justify-between text-warning border-b border-border/50"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </div>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-5 py-4 flex items-center justify-between text-destructive"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">Delete Account</span>
            </div>
          </button>
        </motion.div>

        {/* Version */}
        <motion.div
          className="text-center py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">My Personal Diary</p>
          <p className="text-xs text-muted-foreground mt-1">Version 1.0.0</p>
        </motion.div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <ConfirmationModal
            title="Log Out"
            message="Are you sure you want to log out of your account?"
            confirmLabel="Log Out"
            confirmVariant="warning"
            onConfirm={() => {
              setShowLogoutModal(false)
              onLogout()
            }}
            onCancel={() => setShowLogoutModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmationModal
            title="Delete Account"
            message="This action cannot be undone. All your data, tasks, and settings will be permanently deleted."
            confirmLabel="Delete Account"
            confirmVariant="destructive"
            onConfirm={() => {
              setShowDeleteModal(false)
              onDeleteAccount()
            }}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface SubScreenProps {
  screen: SettingsSubScreen
  onBack: () => void
  settings: UserSettings
  onUpdateSettings: (updates: Partial<UserSettings>) => void
  profile: UserProfile
  onUpdateProfile: (updates: Partial<UserProfile>) => void
}

function SubScreen({ screen, onBack, settings, onUpdateSettings, profile, onUpdateProfile }: SubScreenProps) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const getTitle = () => {
    switch (screen) {
      case 'privacy-policy': return 'Privacy Policy'
      case 'terms-of-service': return 'Terms of Service'
      case 'data-storage': return 'Data & Storage'
      case 'edit-profile': return 'Edit Profile'
      case 'change-password': return 'Change Password'
      default: return ''
    }
  }

  const passwordValidation = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    matches: newPassword === confirmPassword && newPassword.length > 0
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  const handleSaveProfile = () => {
    onUpdateProfile({ name, email })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const handleSavePassword = () => {
    if (isPasswordValid) {
      setPasswordSaved(true)
      setTimeout(() => {
        setPasswordSaved(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }, 2000)
    }
  }

  return (
    <motion.div
      className="min-h-screen pb-24 bg-background"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-6 safe-area-inset-top">
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-muted/50"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-2xl font-bold">{getTitle()}</h1>
        </motion.div>
      </div>

      <div className="px-6">
        {screen === 'privacy-policy' && (
          <div className="space-y-6">
            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">Data Collection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We collect information that you provide directly to us, including your name, email address, 
                and task data. This information is used solely to provide and improve our services.
              </p>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">Data Usage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data is used to personalize your experience, provide AI-powered suggestions, 
                and sync your tasks across devices. We do not sell or share your personal information 
                with third parties for marketing purposes.
              </p>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">Permissions</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                  <span><strong>Location:</strong> Used for location-based reminders only when enabled.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Bell className="w-4 h-4 mt-0.5 text-primary" />
                  <span><strong>Notifications:</strong> Used to send reminder alerts and updates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 text-primary" />
                  <span><strong>Calendar:</strong> Used to sync events when calendar integration is enabled.</span>
                </li>
              </ul>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">Storage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data is stored securely on our servers with industry-standard encryption. 
                Local data is stored on your device for offline access. You can delete your data 
                at any time through the account settings.
              </p>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">Third-Party Services</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use the following third-party services to provide our app:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Google Calendar API (for calendar sync)</li>
                <li>• Firebase Cloud Messaging (for push notifications)</li>
                <li>• OpenAI API (for AI-powered suggestions)</li>
              </ul>
            </section>
          </div>
        )}

        {screen === 'terms-of-service' && (
          <div className="space-y-6">
            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">1. Acceptance of Terms</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By accessing or using My Personal Diary, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">2. Use of Service</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You may use our service for personal, non-commercial purposes only. You agree not to 
                misuse the service or help anyone else do so.
              </p>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">3. User Accounts</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are responsible for maintaining the security of your account and password. 
                You must notify us immediately of any unauthorized access to your account.
              </p>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">4. Content Ownership</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You retain ownership of all content you create using our service. By using our service, 
                you grant us a license to store and process your content to provide the service.
              </p>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">5. Termination</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may terminate or suspend your access to the service at any time, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to other users.
              </p>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">6. Limitation of Liability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our service is provided {"as is"} without warranties of any kind. We are not liable for 
                any damages arising from your use of the service.
              </p>
            </section>

            <p className="text-xs text-muted-foreground text-center pt-4">
              Last updated: January 2024
            </p>
          </div>
        )}

        {screen === 'data-storage' && (
          <div className="space-y-6">
            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Local Storage
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tasks stored</span>
                  <span className="font-medium">24 items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Notifications stored</span>
                  <span className="font-medium">12 items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cache size</span>
                  <span className="font-medium">2.4 MB</span>
                </div>
              </div>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-primary" />
                Cloud Sync
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Cloud Sync</span>
                    <p className="text-sm text-muted-foreground mt-0.5">Sync data across devices</p>
                  </div>
                  <motion.button
                    onClick={() => onUpdateSettings({ cloudSyncEnabled: !settings.cloudSyncEnabled })}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      settings.cloudSyncEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full bg-white shadow-sm"
                      animate={{ x: settings.cloudSyncEnabled ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
                
                {settings.cloudSyncEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-3 border-t border-border/50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Sync status</span>
                      <span className="text-sm text-success font-medium flex items-center gap-1">
                        <Check className="w-4 h-4" /> Synced
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last synced</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {settings.lastSyncedAt 
                          ? new Date(settings.lastSyncedAt).toLocaleString() 
                          : 'Just now'
                        }
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </section>

            <section className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-3">Backup</h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Auto Backup</span>
                  <p className="text-sm text-muted-foreground mt-0.5">Backup data automatically</p>
                </div>
                <motion.button
                  onClick={() => onUpdateSettings({ backupEnabled: !settings.backupEnabled })}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    settings.backupEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-sm"
                    animate={{ x: settings.backupEnabled ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            </section>

            <Button variant="outline" className="w-full h-12 rounded-2xl">
              Export All Data
            </Button>
            <Button variant="outline" className="w-full h-12 rounded-2xl text-destructive border-destructive/30 hover:bg-destructive/10">
              Clear Local Cache
            </Button>
          </div>
        )}

        {screen === 'edit-profile' && (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <motion.button
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-12 rounded-xl glass border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 rounded-xl glass border-border/50"
                />
              </div>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              className="w-full h-12 rounded-2xl"
              disabled={!name.trim() || !email.trim()}
            >
              {profileSaved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        )}

        {screen === 'change-password' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="h-12 rounded-xl glass border-border/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-12 rounded-xl glass border-border/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-12 rounded-xl glass border-border/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="glass rounded-2xl p-4">
              <p className="text-sm font-medium mb-3">Password Requirements:</p>
              <div className="space-y-2">
                <PasswordRequirement met={passwordValidation.minLength} text="At least 8 characters" />
                <PasswordRequirement met={passwordValidation.hasUppercase} text="One uppercase letter" />
                <PasswordRequirement met={passwordValidation.hasNumber} text="One number" />
                <PasswordRequirement met={passwordValidation.hasSpecial} text="One special character (!@#$%^&*)" />
                <PasswordRequirement met={passwordValidation.matches} text="Passwords match" />
              </div>
            </div>

            <Button 
              onClick={handleSavePassword} 
              className="w-full h-12 rounded-2xl"
              disabled={!currentPassword || !isPasswordValid}
            >
              {passwordSaved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Password Changed!
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-success' : 'text-muted-foreground'}`}>
      {met ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />}
      {text}
    </div>
  )
}

interface SettingToggleProps {
  label: string
  description?: string
  enabled: boolean
  onToggle: () => void
}

function SettingToggle({ label, description, enabled, onToggle }: SettingToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between border-b border-border/50 last:border-b-0"
    >
      <div>
        <span className="font-medium">{label}</span>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <motion.div
        className={`w-12 h-7 rounded-full p-1 transition-colors ${
          enabled ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ x: enabled ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </button>
  )
}

interface SettingLinkProps {
  label: string
  icon?: React.ElementType
  onClick: () => void
}

function SettingLink({ label, icon: Icon, onClick }: SettingLinkProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full px-5 py-4 flex items-center justify-between border-b border-border/50 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  )
}

interface ConfirmationModalProps {
  title: string
  message: string
  confirmLabel: string
  confirmVariant: 'warning' | 'destructive'
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmationModal({ title, message, confirmLabel, confirmVariant, onConfirm, onCancel }: ConfirmationModalProps) {
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />
      <motion.div
        className="fixed inset-x-4 bottom-4 z-50 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
      >
        <div className="glass-strong rounded-3xl p-6">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6">{message}</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              className={`flex-1 h-12 rounded-2xl ${
                confirmVariant === 'destructive' 
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                  : 'bg-warning hover:bg-warning/90 text-warning-foreground'
              }`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
