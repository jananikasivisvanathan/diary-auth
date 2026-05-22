'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Calendar, MapPin, MessageSquare, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnboardingScreenProps {
  onComplete: () => void
}

const onboardingSteps = [
  {
    id: 1,
    title: 'Never miss a task',
    description: 'Enable notifications to receive timely reminders about your tasks and events.',
    icon: Bell,
    action: 'Enable Notifications',
    skipLabel: 'Skip for now',
    color: 'bg-primary',
  },
  {
    id: 2,
    title: 'Sync your calendar',
    description: 'Connect Google Calendar to see all your events in one place and avoid conflicts.',
    icon: Calendar,
    action: 'Connect Google Calendar',
    skipLabel: 'Skip',
    color: 'bg-accent',
  },
  {
    id: 3,
    title: 'Location reminders',
    description: 'Get reminded about tasks when you arrive at or leave specific locations.',
    icon: MapPin,
    action: 'Enable Location',
    skipLabel: 'Skip',
    color: 'bg-success',
  },
  {
    id: 4,
    title: 'Smart detection',
    description: 'Automatically detect dates and times from your messages and emails to create reminders.',
    icon: MessageSquare,
    action: 'Enable',
    skipLabel: 'Skip',
    color: 'bg-warning',
    preview: true,
  },
]

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [enabledFeatures, setEnabledFeatures] = useState<number[]>([])

  const step = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1

  const handleAction = () => {
    setEnabledFeatures(prev => [...prev, step.id])
    nextStep()
  }

  const nextStep = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 py-12 safe-area-inset-top safe-area-inset-bottom">
        {/* Progress indicators */}
        <div className="flex gap-2 mb-12">
          {onboardingSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: index <= currentStep ? 1 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Icon */}
            <motion.div
              className={`w-20 h-20 rounded-3xl ${step.color} flex items-center justify-center mb-8 shadow-lg`}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              <step.icon className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title & Description */}
            <motion.h1
              className="text-3xl font-bold mb-4 text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {step.title}
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground mb-8 text-pretty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {step.description}
            </motion.p>

            {/* Smart Detection Preview */}
            {step.preview && (
              <motion.div
                className="glass rounded-2xl p-4 mb-8 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">WhatsApp Message</p>
                    <p className="text-muted-foreground text-sm">
                      {"Hey! Don't forget about our "}
                      <span className="underline decoration-primary decoration-2 text-foreground font-medium">
                        meeting tomorrow at 4 PM
                      </span>
                    </p>
                  </div>
                </div>

                <motion.div
                  className="bg-primary/10 rounded-xl p-4 border border-primary/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Create reminder from this message?</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-xl">
                      Enable
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-xl">
                      Skip
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="mt-auto space-y-3">
              <Button 
                onClick={handleAction}
                className="w-full h-14 text-lg rounded-2xl"
              >
                {step.action}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                onClick={nextStep}
                variant="ghost"
                className="w-full h-12 text-muted-foreground"
              >
                {step.skipLabel}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
