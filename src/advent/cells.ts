import type { Day } from "../api/types"
import cellEmpty from "../assets/images/cells/cell-empty1.png"
import cellKhl from "../assets/images/cells/cell-khl1.png"
import cellPrize from "../assets/images/cells/cell-prize1.png"
import cellRfc from "../assets/images/cells/cell-rfc1.png"
import cellRuspace from "../assets/images/cells/cell-ruspace1.png"
import cellZenit from "../assets/images/cells/cell-zenit1.png"
import iceIphone from "../assets/images/cells/ice-iphone1.png"
import icePrize from "../assets/images/cells/ice-prize1.png"
import iceYandex from "../assets/images/cells/ice-yandex1.png"
import iceZenit from "../assets/images/cells/ice-zenit.png"
import { dayOf } from "./format"

export type PartnerKey = "zenit" | "rfc" | "khl" | "ruspace"

const PARTNER_CELL: Record<PartnerKey, string> = {
  zenit: cellZenit,
  rfc: cellRfc,
  khl: cellKhl,
  ruspace: cellRuspace,
}

const PARTNER_DAY: Record<number, PartnerKey> = {
  3: "zenit",
  7: "rfc",
  11: "khl",
  15: "ruspace",
}

export function partnerKey(day: Day): PartnerKey | null {
  if (day.kind !== "partner") return null
  const title = `${day.partner?.title ?? ""} ${day.prize?.title ?? ""}`.toLowerCase()
  if (title.includes("зенит") || title.includes("zenit")) return "zenit"
  if (title.includes("кхл") || title.includes("khl")) return "khl"
  if (title.includes("роскосмос") || title.includes("space") || title.includes("ruspace")) return "ruspace"
  if (title.includes("рфс") || title.includes("rfc")) return "rfc"
  return PARTNER_DAY[dayOf(day.date)] ?? null
}

function nextDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + 1))
  const monthText = String(date.getUTCMonth() + 1).padStart(2, "0")
  const dayText = String(date.getUTCDate()).padStart(2, "0")
  return `${date.getUTCFullYear()}-${monthText}-${dayText}`
}

export function cellView(day: Day, days: Day[]) {
  const key = partnerKey(day)
  if (key === "zenit" && day.status !== "future") return { src: iceZenit, contain: true }
  const current = [...days].reverse().find((item) => item.status !== "future")
  const preview =
    current != null &&
    day.date === nextDate(current.date) &&
    day.kind !== "partner" &&
    day.status === "future"

  if (day.status === "closed" || (day.status === "joined" && day.kind !== "partner")) {
    return { src: iceYandex, contain: true }
  }
  if (day.kind === "final" && (day.status === "today" || day.status === "joined")) {
    return { src: iceIphone, contain: true }
  }
  if (key && (day.status === "today" || day.status === "joined")) {
    return { src: key === "zenit" ? iceZenit : PARTNER_CELL[key], contain: true }
  }
  if (day.status === "today") return { src: icePrize, contain: false }
  if (preview) return { src: cellPrize, contain: false }
  if (key) return { src: PARTNER_CELL[key], contain: false }
  return { src: cellEmpty, contain: false }
}
