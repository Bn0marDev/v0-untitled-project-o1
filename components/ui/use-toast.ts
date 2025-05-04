"use client"

import type React from "react"

// Simplified version of the toast hook
import { useState } from "react"

type Toast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({
    title,
    description,
    action,
    variant = "default",
  }: {
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: "default" | "destructive"
  }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = {
      id,
      title,
      description,
      action,
      variant,
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 5000)

    return {
      id,
      dismiss: () => setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id)),
      update: (props: Partial<Omit<Toast, "id">>) => {
        setToasts((prevToasts) =>
          prevToasts.map((toast) =>
            toast.id === id
              ? {
                  ...toast,
                  ...props,
                }
              : toast,
          ),
        )
      },
    }
  }

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      if (toastId) {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId))
      } else {
        setToasts([])
      }
    },
  }
}

// For direct import
export const toast = ({
  title,
  description,
  action,
  variant = "default",
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}) => {
  // This is a simplified version that just logs to console
  // In a real app, you'd use a proper toast system
  console.log(`Toast: ${title} - ${description}`)

  // Return a dummy object to match the expected API
  return {
    id: Math.random().toString(36).substring(2, 9),
    dismiss: () => {},
    update: () => {},
  }
}
