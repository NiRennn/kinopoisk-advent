import { mediaUrl } from "../api/client"
import type { AdventUser, Day } from "../api/types"

export type AdventPhase = "ready" | "auth" | "subscribe" | "error"

export type AdventSession = {
  live: boolean
  phase: AdventPhase
  days: Day[]
  botUrl: string
  user: AdventUser | null
  onboarding: boolean
}

let session: AdventSession | null = null

export function setAdventSession(value: AdventSession) {
  session = value
}

export function getAdventSession() {
  return session
}

export function prepareDay(day: Day): Day {
  return {
    ...day,
    prize: day.prize ? { ...day.prize, image: mediaUrl(day.prize.image) } : day.prize,
    fact: day.fact ? { ...day.fact, image: mediaUrl(day.fact.image) } : day.fact,
  }
}
