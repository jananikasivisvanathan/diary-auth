'use client'

import { motion } from 'framer-motion'
import { Home, Calendar, Bell, Settings, Plus } from 'lucide-react'
import type { AppScreen } from '@/lib/types'

interface BottomNavigationProps {
  currentScreen: AppScreen
  onNavigate: (screen: AppScreen) => void
  notificationCount?: number
  onAddTask: () => void
}

const navItems = [
  { id: 'home' as const, icon: Home, label: 'Home' },
  { id: 'calendar' as const, icon: Calendar, label: 'Calendar' },
  { id: 'notifications' as const, icon: Bell, label: 'Alerts' },
  { id: 'settings' as const, icon: Settings, label: 'Settings' },
]

export function BottomNavigation({ currentScreen, onNavigate, notificationCount = 0, onAddTask }: BottomNavigationProps) {
  return (
    <>
      {/* Floating Add Button - Centered above nav bar */}
      <motion.div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.button
          onClick={onAddTask}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      </motion.div>

      {/* Bottom Navigation Bar - Shopee style pill shape */}
      <motion.nav
        className="fixed bottom-4 left-4 right-4 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="glass-strong rounded-[32px] shadow-lg shadow-black/10 border border-glass-border overflow-hidden">
          <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
            {navItems.map((item, index) => {
              const isActive = currentScreen === item.id
              const Icon = item.icon
              
              // Add space in middle for FAB
              const isLeftSide = index < 2
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex flex-col items-center gap-0.5 py-2 px-4 rounded-2xl transition-all ${
                    isLeftSide ? 'mr-auto' : 'ml-auto'
                  } ${index === 1 ? 'mr-8' : ''} ${index === 2 ? 'ml-8' : ''}`}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className="relative"
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {/* Active background pill */}
                    {isActive && (
                      <motion.div
                        className="absolute -inset-2 bg-primary/15 rounded-xl"
                        layoutId="activeTab"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    <Icon 
                      className={`w-6 h-6 relative z-10 transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    
                    {/* Notification badge */}
                    {item.id === 'notifications' && notificationCount > 0 && (
                      <motion.div
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive rounded-full flex items-center justify-center px-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                  
                  <span className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {item.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.nav>
    </>
  )
}
