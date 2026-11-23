import { api } from "./client"
import type { CheckSubResponse, Day, OpenResponse, WinnerForm } from "./types"

export const openApp = () => api<OpenResponse>("app/open")

export const getDay = (date: string) => api<Day>(`days/${date}`)

export const checkPartner = (date: string) =>
  api<CheckSubResponse>(`days/${date}/check-sub`, { method: "POST" })

export const joinDay = (date: string) =>
  api<Day>(`days/${date}/join`, { method: "POST" })

export const submitWinnerForm = (winnerId: number, form: WinnerForm) =>
  api<{ ok: boolean }>(`winners/${winnerId}/form`, { method: "POST", body: form })
