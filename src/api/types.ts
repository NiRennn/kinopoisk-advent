export type DayKind = "secret" | "partner" | "final"
export type DayStatus = "future" | "today" | "joined" | "closed"
export type DayResult = "pending" | "missed" | "won" | "lost"

export type Prize = {
  title: string
  text: string
  image: string | null
  type: "physical" | "digital"
}

export type Partner = {
  title: string
  url: string
}

export type Fact = {
  title: string
  text: string
  url: string | null
  image: string | null
}

export type Winner = {
  id: number
  form_required: boolean
  form_filled: boolean
  form_deadline: string
  promo_code: string | null
}

export type Day = {
  date: string
  kind: DayKind
  status: DayStatus
  participated: boolean
  result: DayResult | null
  results_at: string | null
  prize: Prize | null
  partner?: Partner | null
  fact?: Fact | null
  winner?: Winner | null
}

export type AdventUser = {
  id: number
  name: string
  username: string | null
  photo: string | null
}

export type Trial = {
  code: string | null
  terms: string | null
}

export type OpenResponse = {
  user: AdventUser
  subscribed: boolean
  bot_url: string
  days: Day[]
  trial?: Trial | null
}

export type CheckSubResponse = {
  subscribed: boolean
}

export type WinnerForm = {
  full_name: string
  contact: string
  city: string
  address: string
  consent: boolean
}
