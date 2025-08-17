import { toast as sonnerToast } from "sonner"

type ToastVariant = "default" | "success" | "destructive" | "warning" | "info"

interface ToastOptions {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

interface EnhancedToastOptions extends ToastOptions {
  variant?: ToastVariant
}

export const useToast = () => {
  const toast = (options: EnhancedToastOptions) => {
    const { variant = "default", title, description, action, duration = 4000 } = options

    switch (variant) {
      case "success":
        return sonnerToast.success(title || "Operación exitosa", {
          description,
          duration,
          action: action ? {
            label: action.label,
            onClick: action.onClick
          } : undefined
        })
      
      case "destructive":
        return sonnerToast.error(title || "Error", {
          description,
          duration,
          action: action ? {
            label: action.label,
            onClick: action.onClick
          } : undefined
        })
      
      case "warning":
        return sonnerToast.warning(title || "Advertencia", {
          description,
          duration,
          action: action ? {
            label: action.label,
            onClick: action.onClick
          } : undefined
        })
      
      case "info":
        return sonnerToast.info(title || "Información", {
          description,
          duration,
          action: action ? {
            label: action.label,
            onClick: action.onClick
          } : undefined
        })
      
      default:
        return sonnerToast(title || "Notificación", {
          description,
          duration,
          action: action ? {
            label: action.label,
            onClick: action.onClick
          } : undefined
        })
    }
  }

  return {
    toast,
    success: (options: ToastOptions) => toast({ ...options, variant: "success" }),
    error: (options: ToastOptions) => toast({ ...options, variant: "destructive" }),
    warning: (options: ToastOptions) => toast({ ...options, variant: "warning" }),
    info: (options: ToastOptions) => toast({ ...options, variant: "info" }),
    dismiss: sonnerToast.dismiss
  }
}