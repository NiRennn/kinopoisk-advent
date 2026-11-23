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

export function cellView(day: Day, days: Day[]) {
  const key = partnerKey(day)
  const current = days.find((item) => item.status === "today" || item.status === "joined")
  const preview =
    current != null &&
    dayOf(day.date) === dayOf(current.date) + 1 &&
    day.kind === "secret" &&
    day.status === "future" &&
    (current.status === "joined" || current.kind === "partner")

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
