import { useEffect, useRef, useState, type MouseEvent } from "react"
import { useNavigate } from "react-router-dom"
import "./Game.scss"
import appRoutes from "../../routes/routes"
import Onboarding from "../Onboarding/Onboarding"
import SecretGift from "../SecretGift/SecretGift"
import PartnerGift from "../PartnerGift/PartnerGift"
import LaterDay from "../LaterDay/LaterDay"
import PastDay from "../PastDay/PastDay"
import Result, { type ResultOutcome } from "../Result/Result"
import Button from "../Button/Button"
import { ApiError } from "../../api/client"
import { checkPartner, getDay, joinDay, openApp, submitWinnerForm } from "../../api/advent"
import type { Day, WinnerForm } from "../../api/types"
import { getAdventSession, prepareDay, type AdventPhase } from "../../advent/session"
import { cellView, partnerKey, partnerLabel } from "../../advent/cells"
import { dayOf, resultsLabel } from "../../advent/format"
import { joinMockDay } from "../../advent/mock"
import logo from "../../assets/icons/kinopoisk.svg"
import info from "../../assets/icons/info-gray.svg"
import bubble from "../../assets/images/bubble.png"
import share from '../../assets/icons/share.svg'
import ShareTrial from "../ShareTrial/ShareTrial"

const SEEN_KEY = "kp-advent-seen-results"
const ONBOARDING_KEY = "kp-advent-onboarding"

type Modal =
  | { type: "gift" | "partner" | "later" | "past" | "result"; day: Day }
  | null

function readSeen() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]") as unknown
    return new Set(Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [])
  } catch {
    return new Set<string>()
  }
}

function onboardingSeen() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "1"
  } catch {
    return false
  }
}

function markOnboardingSeen() {
  try {
    localStorage.setItem(ONBOARDING_KEY, "1")
  } catch {
    // Storage can be unavailable in private mode.
  }
}

function markSeen(date: string) {
  const seen = readSeen()
  seen.add(date)
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))
}

function outcomeOf(result: Day["result"]): ResultOutcome | null {
  if (result === "won") return "win"
  if (result === "lost") return "lose"
  if (result === "missed") return "missed"
  return null
}

function screenFor(day: Day, mode: "cell" | "result"): Modal {
  if (mode === "result" && day.result && day.result !== "pending") return { type: "result", day }
  if (day.status === "future") return { type: "later", day }
  if (day.status === "closed" && day.result && day.result !== "pending") return { type: "past", day }
  if (day.kind === "partner") return { type: "partner", day }
  return { type: "gift", day }
}

function pendingAction(days: Day[]): { day: Day; mode: "cell" | "result" } | null {
  const query = new URLSearchParams(window.location.search).get("day")
  if (query) {
    const day = days.find((item) => item.date === query)
    return day ? { day, mode: "cell" } : null
  }
  const seen = readSeen()
  const day = [...days].reverse().find((item) => (item.result === "won" || item.result === "lost") && !seen.has(item.date))
  return day ? { day, mode: "result" } : null
}

function openTelegram(url: string) {
  if (!url) return
  const tg = window.Telegram?.WebApp
  if (typeof tg?.openTelegramLink === "function") tg.openTelegramLink(url)
  else window.open(url, "_blank", "noopener")
}

function Game() {
  const navigate = useNavigate()
  const initial = getAdventSession()
  const [phase, setPhase] = useState<AdventPhase>(initial?.phase ?? "error")
  const [days, setDays] = useState<Day[]>(initial?.days ?? [])
  const [modal, setModal] = useState<Modal>(null)
  const [botUrl, setBotUrl] = useState(initial?.botUrl ?? "")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const openedToday = useRef(false)
  const introduced = useRef(false)
  const liveRef = useRef(initial?.live ?? false)
  const mockSub = useRef(false)
  const pendingRef = useRef<{ day: Day; mode: "cell" | "result" } | null>(null)
  const gameRef = useRef<HTMLDivElement>(null)

  const mergeDay = (day: Day) => {
    const next = prepareDay(day)
    setDays((current) => current.map((item) => (item.date === next.date ? { ...item, ...next, fact: next.fact ?? item.fact, winner: next.winner ?? item.winner } : item)))
    setModal((current) => {
      if (!current || current.day.date !== next.date) return current
      return {
        ...current,
        day: { ...current.day, ...next, fact: next.fact ?? current.day.fact, winner: next.winner ?? current.day.winner },
      }
    })
    return next
  }

  useEffect(() => {
    if (getAdventSession()) return
    navigate({ pathname: appRoutes.LOADDING, search: window.location.search }, { replace: true })
  }, [navigate])

  useEffect(() => {
    if (phase !== "ready" || introduced.current) return
    introduced.current = true
    if (onboardingSeen()) return
    pendingRef.current = pendingAction(days)
    setShowOnboarding(true)
  }, [phase])

  useEffect(() => {
    let cancelled = false

    const refresh = async () => {
      if (!liveRef.current) return
      try {
        const data = await openApp()
        if (cancelled) return
        setBotUrl(data.bot_url)
        if (!data.subscribed) {
          setPhase("subscribe")
          return
        }
        const list = data.days.map(prepareDay)
        setDays(list)
        setModal((current) => {
          if (!current) return current
          const fresh = list.find((item) => item.date === current.day.date)
          if (!fresh) return current
          const merged = { ...current.day, ...fresh, fact: fresh.fact ?? current.day.fact, winner: fresh.winner ?? current.day.winner }
          if ((current.type === "gift" || current.type === "partner") && merged.status === "closed" && merged.result && merged.result !== "pending") {
            return { type: "past", day: merged }
          }
          return { ...current, day: merged }
        })
      } catch {
        // Keep the calendar that is already on screen.
      }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  useEffect(() => {
    if (showOnboarding || modal || showShare || phase !== "ready" || openedToday.current) {
      setShowHint(false)
      return
    }

    let timer = window.setTimeout(() => setShowHint(true), 5000)
    const reset = () => {
      setShowHint(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setShowHint(true), 5000)
    }

    const node = gameRef.current
    const events = ["pointerdown", "wheel", "keydown", "touchstart"] as const
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }))
    node?.addEventListener("scroll", reset, { passive: true })

    return () => {
      window.clearTimeout(timer)
      events.forEach((event) => window.removeEventListener(event, reset))
      node?.removeEventListener("scroll", reset)
    }
  }, [showOnboarding, modal, showShare, phase])

  const openCell = async (event: MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".game__content-field-item")
    const date = button?.dataset.date
    if (!date) return
    const known = days.find((item) => item.date === date)
    if (!known) return
    if (known.status === "today") {
      openedToday.current = true
      setShowHint(false)
    }
    if (!liveRef.current || known.status === "future") {
      setModal(screenFor(known, "cell"))
      return
    }
    try {
      const full = mergeDay(await getDay(date))
      setModal(screenFor(full, "cell"))
    } catch (reason) {
      if (reason instanceof ApiError && reason.http === 403) {
        setPhase("subscribe")
        return
      }
      setModal(screenFor(known, "cell"))
    }
  }

  const participate = async (day: Day) => {
    if (!liveRef.current) {
      mergeDay(joinMockDay(day))
      return
    }
    try {
      mergeDay(await joinDay(day.date))
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === "day_closed") {
        const fresh = mergeDay(await getDay(day.date))
        setModal(screenFor(fresh, "cell"))
        return
      }
      throw reason
    }
  }

  const sendForm = async (day: Day, form: WinnerForm) => {
    if (!day.winner) return
    await submitWinnerForm(day.winner.id, form)
    mergeDay({ ...day, winner: { ...day.winner, form_filled: true } })
  }

  const finishOnboarding = () => {
    markOnboardingSeen()
    setShowOnboarding(false)
    const action = pendingRef.current
    pendingRef.current = null
    if (!action) return
    if (!liveRef.current || action.day.status === "future") {
      setModal(screenFor(action.day, action.mode))
      return
    }
    void getDay(action.day.date)
      .then((full) => {
        const next = mergeDay(full)
        setModal(screenFor(next, action.mode))
      })
      .catch(() => setModal(screenFor(action.day, action.mode)))
  }

  const closeResult = () => {
    if (modal?.type === "result") markSeen(modal.day.date)
    setModal(null)
  }

  const day = modal?.day
  const outcome = day ? outcomeOf(day.result) : null
  const label = day ? resultsLabel(day.results_at, day.result) : ""

  if (!initial) return null

  return (
    <div className="game" ref={gameRef}>
      {phase === "ready" && (
        <div className="game__content">
          <img src={logo} alt="" className="game__content-logo" />
          <span className="game__content-header">Месяц подарков</span>
          <div className="game__content-field" onClick={openCell}>
            {days.map((item, index) => {
              const today = item.status === "today"
              const view = cellView(item, days)
              const numberOpen = item.status !== "future"
              const hintMirror = today && index % 3 === 2
              return (
                <button
                  key={item.date}
                  className={`game__content-field-item${today && showHint ? " game__content-field-item--hint" : ""}`}
                  type="button"
                  data-date={item.date}
                >
                  <img
                    src={view.src}
                    alt=""
                    className={`game__content-field-item-img${view.contain ? " game__content-field-item-img--past" : ""}`}
                  />
                  <span className={`game__content-field-item-number${numberOpen ? " game__content-field-item-number--open" : ""}`} data-n={dayOf(item.date)}>
                    {dayOf(item.date)}
                  </span>
                  {today && (
                    <span className={`game__hint${hintMirror ? " game__hint--mirror" : ""}${showHint ? " game__hint--in" : ""}`} aria-hidden={!showHint}>
                      <img src={bubble} alt="" className="game__hint-bubble" />
                      <span className="game__hint-text">
                        Нажмите чтобы узнать,
                        <br />
                        что выпало сегодня!
                      </span>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {phase === "ready" && (
        <div className="game__blur">
          <div className="game__blur-wrapper">
          <div className="game__blur-tip">
            <img src={info} alt="" className="game__blur-tip-img" />
            <span className="game__blur-tip-text">Нажимайте на кубики льда каждый день, чтобы увидеть приз, который будет разыгрываться сегодня</span>
          </div>
          <button type="button" className="game__blur-share-btn" aria-label="Поделиться" onClick={() => setShowShare(true)}>
            <img src={share} alt="" className="game__blur-share-btn-img"/>
          </button>
          </div>

        </div>
      )}

      {showShare && <ShareTrial onClose={() => setShowShare(false)} />}

      {phase === "auth" && (
        <div className="game__gate">
          <h1>Откройте адвент из бота</h1>
          <p>Авторизация работает только внутри Telegram.</p>
        </div>
      )}

      {phase === "subscribe" && (
        <div className="game__gate">
          <h1>Сначала подпишитесь на каналы в боте</h1>
          {botUrl && <Button onClick={() => openTelegram(botUrl)}>Открыть бота</Button>}
        </div>
      )}

      {phase === "error" && (
        <div className="game__gate">
          <h1>Нет связи с адвентом</h1>
          <p>Проверьте сеть и попробуйте ещё раз.</p>
          <Button onClick={() => navigate({ pathname: appRoutes.LOADDING, search: window.location.search }, { replace: true })}>Повторить</Button>
        </div>
      )}

      {phase === "ready" && showOnboarding && <Onboarding onClose={finishOnboarding} />}

      {phase === "ready" && modal?.type === "gift" && (
        <SecretGift
          joined={modal.day.status === "joined" || modal.day.participated}
          title={modal.day.prize?.title || "Шанс на розыгрыш"}
          text={modal.day.prize?.text || ""}
          image={modal.day.prize?.image}
          resultsLabel={label}
          resultsAt={modal.day.results_at}
          onJoin={() => participate(modal.day)}
          onClose={() => setModal(null)}
        />
      )}

      {phase === "ready" && modal?.type === "partner" && day && (
        <PartnerGift
          joined={day.status === "joined" || day.participated}
          title={day.prize?.title || "Клубный мерч!"}
          partnerName={partnerLabel(day)}
          mark={partnerKey(day)}
          image={day.prize?.image}
          resultsLabel={label}
          resultsAt={day.results_at}
          onSubscribe={() => {
            if (!liveRef.current) {
              mockSub.current = true
              return
            }
            if (day.partner?.url) openTelegram(day.partner.url)
          }}
          onCheck={async () => {
            if (!liveRef.current) return mockSub.current
            const result = await checkPartner(day.date)
            return result.subscribed
          }}
          onJoin={() => participate(day)}
          onClose={() => setModal(null)}
        />
      )}

      {phase === "ready" && modal?.type === "later" && (
        <LaterDay date={modal.day.date} onClose={() => setModal(null)} />
      )}

      {phase === "ready" && modal?.type === "past" && (
        <PastDay
          image={modal.day.prize?.image}
          text={modal.day.prize?.text}
          onClose={() => setModal(null)}
          onOpen={() => setModal({ type: "result", day: modal.day })}
        />
      )}

      {phase === "ready" && modal?.type === "result" && day && outcome && (
        <Result
          date={day.date}
          outcome={outcome}
          fact={day.fact}
          prizeTitle={day.prize?.title}
          prizeText={day.prize?.text}
          prizeImage={day.prize?.image}
          prizeType={day.prize?.type}
          formRequired={day.winner?.form_required ?? false}
          formFilled={day.winner?.form_filled ?? false}
          promoCode={day.winner?.promo_code}
          onSubmit={liveRef.current && day.winner ? (form) => sendForm(day, form) : undefined}
          onClose={closeResult}
        />
      )}
    </div>
  )
}

export default Game
