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
