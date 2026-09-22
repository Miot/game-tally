/**
 * 命令式反馈：便条（toast）与确认便签（confirm）。
 *
 * 两者都只维护状态，渲染交给挂在应用外壳上的 PadFeedbackHost。
 * 这样组件内部可以像调函数一样提示，而外观完全属于计分纸这套世界。
 */
import { readonly, ref } from 'vue'

export type ToastTone = 'plain' | 'alert'

export interface ToastRecord {
  id: number
  message: string
  tone: ToastTone
}

export interface ToastOptions {
  message: string
  tone?: ToastTone
  /** 毫秒，默认 2200 */
  duration?: number
}

const toasts = ref<ToastRecord[]>([])
let nextId = 1

/** 同时最多贴三张便条，更早的自动让位 */
const MAX_VISIBLE = 3

export function showToast(input: string | ToastOptions): void {
  const options: ToastOptions = typeof input === 'string' ? { message: input } : input
  const id = nextId++
  toasts.value = [
    ...toasts.value.slice(-(MAX_VISIBLE - 1)),
    { id, message: options.message, tone: options.tone ?? 'plain' },
  ]
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }, options.duration ?? 2200)
}

export const activeToasts = readonly(toasts)

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  /** 破坏性操作用印刷红渲染确认键 */
  destructive?: boolean
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (ok: boolean) => void
}

const confirmRequest = ref<ConfirmRequest | null>(null)

/** 返回 true 表示用户确认，false 表示取消；不会抛出 */
export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    confirmRequest.value = { ...options, resolve }
  })
}

export const activeConfirm = readonly(confirmRequest)

export function settleConfirm(ok: boolean): void {
  const request = confirmRequest.value
  if (!request) return
  confirmRequest.value = null
  request.resolve(ok)
}
