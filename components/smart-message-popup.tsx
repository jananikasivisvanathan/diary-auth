'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Mail, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SmartMessagePopupProps {
  isOpen: boolean
  onClose: () => void
  onCreateReminder: (text: string) => void
}

interface DetectedMessage {
  id: string
  source: 'whatsapp' | 'email' | 'sms'
  sender: string
  text: string
  detectedDate: string
  detectedTime?: string
}

const mockMessages: DetectedMessage[] = [
  {
    id: '1',
    source: 'whatsapp',
    sender: 'John Smith',
    text: 'Hey! Project meeting tomorrow at 4 PM in the conference room.',
    detectedDate: 'tomorrow',
    detectedTime: '4 PM',
  },
  {
    id: '2',
    source: 'email',
    sender: 'work@company.com',
    text: 'Reminder: Submit your quarterly report by Friday 5 PM.',
    detectedDate: 'Friday',
    detectedTime: '5 PM',
  },
]

export function SmartMessagePopup({ isOpen, onClose, onCreateReminder }: SmartMessagePopupProps) {
  const [messages] = useState<DetectedMessage[]>(mockMessages)
  const [selectedMessage, setSelectedMessage] = useState<DetectedMessage | null>(null)

  const handleCreate = () => {
    if (selectedMessage) {
      onCreateReminder(selectedMessage.text)
      onClose()
    }
  }

  const getSourceIcon = (source: DetectedMessage['source']) => {
    switch (source) {
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-green-500" />
      case 'email':
        return <Mail className="w-5 h-5 text-blue-500" />
      default:
        return <MessageSquare className="w-5 h-5 text-muted-foreground" />
    }
  }

  const highlightDateTimeText = (text: string, date: string, time?: string) => {
    let result = text
    const patterns = [date, time].filter(Boolean) as string[]
    
    patterns.forEach(pattern => {
      const regex = new RegExp(`(${pattern})`, 'gi')
      result = result.replace(regex, '|||$1|||')
    })
    
    const parts = result.split('|||')
    
    return parts.map((part, index) => {
      const isHighlighted = patterns.some(p => part.toLowerCase() === p.toLowerCase())
      return isHighlighted ? (
        <span key={index} className="underline decoration-primary decoration-2 text-foreground font-medium">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    })
  }

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
            <div className="glass-strong rounded-3xl p-6 max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Smart Detection</h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted/50"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                We detected dates and times in your recent messages. Tap one to create a reminder.
              </p>

              {/* Messages */}
              <div className="space-y-3 mb-6">
                {messages.map((message) => (
                  <motion.button
                    key={message.id}
                    onClick={() => setSelectedMessage(selectedMessage?.id === message.id ? null : message)}
                    className={`w-full text-left glass rounded-2xl p-4 transition-all ${
                      selectedMessage?.id === message.id 
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/30'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                        {getSourceIcon(message.source)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{message.sender}</span>
                          <span className="text-xs text-muted-foreground capitalize">{message.source}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {highlightDateTimeText(message.text, message.detectedDate, message.detectedTime)}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Confirmation */}
              {selectedMessage && (
                <motion.div
                  className="bg-primary/10 rounded-2xl p-4 border border-primary/20 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Create reminder from this message?</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedMessage.detectedDate}
                    {selectedMessage.detectedTime && ` at ${selectedMessage.detectedTime}`}
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl"
                >
                  Ignore
                </Button>
                <Button 
                  onClick={handleCreate}
                  className="flex-1 h-12 rounded-2xl"
                  disabled={!selectedMessage}
                >
                  Create Reminder
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
