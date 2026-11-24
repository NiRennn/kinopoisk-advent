const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
]

type MoscowDate = { y: number; m: number; d: number; hm: string }

function moscowDate(iso: string): MoscowDate {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Moscow",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  )

  return {
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
    hm: `${parts.hour}:${parts.minute}`,
  }
}

export function dayOf(date: string) {
  return Number(date.slice(8, 10))
}

export function formatDayMonth(value: string) {
  const calendar = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (calendar) return `${Number(calendar[3])} ${MONTHS[Number(calendar[2]) - 1]}`
  const when = moscowDate(value)
  return `${when.d} ${MONTHS[when.m - 1]}`
}

export function resultsLabel(iso: string | null, result: string | null) {
  if (!iso) return "Итоги скоро"

  const when = moscowDate(iso)
  const now = moscowDate(new Date().toISOString())
  const whenStamp = Date.UTC(when.y, when.m - 1, when.d)
  const nowStamp = Date.UTC(now.y, now.m - 1, now.d)

  if ((result === "pending" || result === null) && whenStamp < nowStamp) {
    return "Итоги скоро"
  }

  const tomorrow = new Date(nowStamp + 86_400_000)
  const isTomorrow =
    when.y === tomorrow.getUTCFullYear() &&
    when.m === tomorrow.getUTCMonth() + 1 &&
    when.d === tomorrow.getUTCDate()

  if (isTomorrow) return `Итоги завтра в ${when.hm} МСК`
  return `Итоги ${when.d} ${MONTHS[when.m - 1]} в ${when.hm} МСК`
}

export function finalWhen(iso: string | null) {
  if (!iso) return "скоро"
  const when = moscowDate(iso)
  const now = moscowDate(new Date().toISOString())
  const whenStamp = Date.UTC(when.y, when.m - 1, when.d)
  const nowStamp = Date.UTC(now.y, now.m - 1, now.d)
  const tomorrow = new Date(nowStamp + 86_400_000)
  const isToday = whenStamp === nowStamp
  const isTomorrow =
    when.y === tomorrow.getUTCFullYear() &&
    when.m === tomorrow.getUTCMonth() + 1 &&
    when.d === tomorrow.getUTCDate()
  const date = `${when.d} ${MONTHS[when.m - 1]}`
  if (isToday) return `сегодня, ${date}, в ${when.hm} МСК`
  if (isTomorrow) return `завтра, ${date}, в ${when.hm} МСК`
  return `${date}, в ${when.hm} МСК`
}

export function joinedCopy(title: string, iso: string | null) {
  const prize = title.replace(/\s*\n\s*/g, " ").trim() || "приз"
  const tail = "Когда они будут готовы, в Telegram придет уведомление."
  if (!iso) return `Вы участвуете в розыгрыше ${prize}! Итоги появятся скоро. ${tail}`

  const when = moscowDate(iso)
  const now = moscowDate(new Date().toISOString())
  const whenStamp = Date.UTC(when.y, when.m - 1, when.d)
  const nowStamp = Date.UTC(now.y, now.m - 1, now.d)
  const tomorrow = new Date(nowStamp + 86_400_000)
  const isTomorrow =
    when.y === tomorrow.getUTCFullYear() &&
    when.m === tomorrow.getUTCMonth() + 1 &&
    when.d === tomorrow.getUTCDate()
  const date = `${when.d} ${MONTHS[when.m - 1]}`
  const whenText = isTomorrow ? `завтра, ${date}, после ${when.hm} МСК` : `${date}, после ${when.hm} МСК`

  if ((whenStamp < nowStamp)) return `Вы участвуете в розыгрыше ${prize}! Итоги появятся скоро. ${tail}`
  return `Вы участвуете в розыгрыше ${prize}! Итоги появятся ${whenText}. ${tail}`
}

export function alreadyCopy(iso: string | null) {
  const lead = "Вы уже участвуете в этом розыгрыше. Повторно ничего делать не нужно. Итоги — "
  if (!iso) return `${lead}скоро.`

  const when = moscowDate(iso)
  const now = moscowDate(new Date().toISOString())
  const whenStamp = Date.UTC(when.y, when.m - 1, when.d)
  const nowStamp = Date.UTC(now.y, now.m - 1, now.d)
  if (whenStamp < nowStamp) return `${lead}скоро.`

  const tomorrow = new Date(nowStamp + 86_400_000)
  const isTomorrow =
    when.y === tomorrow.getUTCFullYear() &&
    when.m === tomorrow.getUTCMonth() + 1 &&
    when.d === tomorrow.getUTCDate()
  const whenText = isTomorrow ? `завтра в ${when.hm}` : `${when.d} ${MONTHS[when.m - 1]} в ${when.hm}`
  return `${lead}${whenText} МСК.`
}

function resultsClock(iso: string | null) {
  if (!iso) return null
  const when = moscowDate(iso)
  const now = moscowDate(new Date().toISOString())
  const whenStamp = Date.UTC(when.y, when.m - 1, when.d)
  const nowStamp = Date.UTC(now.y, now.m - 1, now.d)
  if (whenStamp < nowStamp) return null
  const tomorrow = new Date(nowStamp + 86_400_000)
  const isTomorrow =
    when.y === tomorrow.getUTCFullYear() &&
    when.m === tomorrow.getUTCMonth() + 1 &&
    when.d === tomorrow.getUTCDate()
  if (isTomorrow) return `завтра в ${when.hm}`
  return `${when.d} ${MONTHS[when.m - 1]} в ${when.hm}`
}

export function partnerOfferCopy(title: string, iso: string | null) {
  const prize = title.replace(/\s*\n\s*/g, " ").trim() || "приз"
  const when = resultsClock(iso)
  return `Сегодня разыгрывается ${prize}. Условие участия — подписка на канал клуба-партнера. Итоги — ${when ? `${when} МСК` : "скоро"}.`
}

export function partnerSubscribeCopy(title: string, partner: string | null) {
  const prize = title.replace(/\s*\n\s*/g, " ").trim() || "приз"
  const club = partner ? ` ${partner}` : ""
  return `Чтобы получить возможность выиграть ${prize}, подпишитесь на канал клуба-партнера${club}. После подписки можно сразу проверить выполнение условия.`
}
