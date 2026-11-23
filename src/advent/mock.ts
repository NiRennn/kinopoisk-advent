import type { Day, DayResult } from "../api/types"

type MockOutcome = "win" | "lose" | "missed"

const TEST_TODAY = 2
const TEST_RESULT: MockOutcome = "win"

const LOREM =
  "Lorem ipsum dolor sit amet consectetur. Donec orci ullamcorper sed diam in massa. Faucibus ullamcorper ac consequat feugiat sit viverra fringilla feugiat. Dui id eu netus at neque amet."

const FACT = {
  title: "Обратный отсчёт\nбыл настоящим",
  text: "Перед стартом плей-офф КХЛ на Кинопоиске показали запуск корабля «Прогресс МС-33». В этот раз путь к Кубку Гагарина сопровождался настоящим полётом к звёздам.",
  url: null,
  image: null,
}

const RESULT: Record<MockOutcome, DayResult> = {
  win: "won",
  lose: "lost",
  missed: "missed",
}

const SPONSORS: Record<number, { title: string; prize: string }> = {
  3: { title: "Зенит", prize: "Клубный мерч!" },
  7: { title: "РФС", prize: "Приз от РФС" },
  11: { title: "КХЛ", prize: "Приз от КХЛ" },
  15: { title: "Роскосмос", prize: "Приз от Роскосмоса" },
}

function dateOf(day: number) {
  return `2026-12-${String(day).padStart(2, "0")}`
}

export function buildMockDays(): Day[] {
  return Array.from({ length: 31 }, (_, index) => {
    const day = index + 1
    const sponsor = SPONSORS[day]
    const kind = day === 31 ? "final" : sponsor ? "partner" : "secret"
    const status = day < TEST_TODAY ? "closed" : day === TEST_TODAY ? "today" : "future"
    const result = status === "closed" ? RESULT[TEST_RESULT] : null

    return {
      date: dateOf(day),
      kind,
      status,
      participated: status === "closed" && result !== "missed",
      result,
      results_at: status === "future" ? null : `${dateOf(Math.min(day + 1, 31))}T15:00:00+00:00`,
      prize: {
        title: sponsor?.prize ?? (kind === "final" ? "iPhone Duo" : "Шанс на розыгрыш\nЯндекс Станция 3"),
        text: LOREM,
        image: null,
        type: "physical",
      },
      partner: sponsor ? { title: sponsor.title, url: "" } : null,
      fact: status === "closed" ? FACT : null,
      winner:
        result === "won"
          ? {
              id: day,
              form_required: true,
              form_filled: false,
              form_deadline: "2026-12-31T15:00:00+00:00",
              promo_code: null,
            }
          : null,
    }
  })
}

export function joinMockDay(day: Day): Day {
  return { ...day, status: "joined", participated: true, result: "pending" }
}
