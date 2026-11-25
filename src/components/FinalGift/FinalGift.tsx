import { useState } from "react"
import { useTelegramBackButton } from "../../utils/telegramBack"
import { createPortal } from "react-dom"
import "../SecretGift/SecretGift.scss"
import "./FinalGift.scss"
import Button from "../Button/Button"
import logo from "../../assets/icons/kinopoisk.svg"
import phone from "../../assets/images/cells/ice-iphone1.png"
import hlop from "../../assets/icons/hlop.svg"
import cross from "../../assets/icons/cross.svg"
import { finalWhen } from "../../advent/format"
import { formatNbsp } from "../../utils/typography"

type FinalGiftProps = {
  joined: boolean
  title: string
  image?: string | null
  resultsLabel: string
  resultsAt?: string | null
  outcome?: "won" | "lost" | null
  onJoin: () => void | Promise<void>
  onRules?: () => void
  onClaim?: () => void
  onClose: () => void
}

function FinalGift({
  joined,
  title,
  image,
  resultsLabel,
  resultsAt,
  outcome,
  onJoin,
  onRules,
  onClaim,
  onClose,
}: FinalGiftProps) {
  const [closing, setClosing] = useState(false)
  const [joining, setJoining] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [error, setError] = useState("")
  const prize = title.trim() || "iPhone Duo"
  const when = finalWhen(resultsAt ?? null)
  const confirmed = joined || celebrating
  const picture = image || phone

  const close = () => {
    if (closing || joining) return
    setClosing(true)
  }
  useTelegramBackButton(close)

  const join = async () => {
    if (closing || joining) return
    setJoining(true)
    setError("")
    try {
      await onJoin()
      setCelebrating(true)
    } catch {
      setError("Не получилось принять участие")
    } finally {
      setJoining(false)
    }
  }

  if (outcome === "won" || outcome === "lost") {
    const won = outcome === "won"
    return createPortal(
      <div
        className={`final-sheet${closing ? " final-sheet--closing" : ""}`}
        onAnimationEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            event.animationName === "overlay-out" &&
            closing
          ) {
            onClose()
          }
        }}
      >
        <button type="button" className="final__veil" aria-label="Закрыть" onClick={close} />
        <div className="final-sheet__card">
          <button type="button" className="final-sheet__close" aria-label="Закрыть" onClick={close}>
            <img src={cross} alt="" />
          </button>
          {won && <img className="final-sheet__prize" src={picture} alt="" />}
          <div className="final-sheet__copy">
            <h2 className="final-sheet__title">
              {formatNbsp(won ? `Вы выиграли ${prize}!` : "Спасибо, что были с нами!")}
            </h2>
            <p className="final-sheet__text">
              {formatNbsp(
                won
                  ? "Поздравляем с главным подарком адвента! Для получения приза заполните данные для доставки в Telegram-боте"
                  : "В этот раз главный приз достался другому участнику. Спасибо за месяц спортивных историй и розыгрышей на Кинопоиске!",
              )}
            </p>
          </div>
          {won ? (
            <Button onClick={() => onClaim?.()}>Получить приз</Button>
          ) : (
            <Button variant="secondary" onClick={close}>Вернуться в календарь</Button>
          )}
        </div>
      </div>,
      document.body,
    )
  }

  return createPortal(
    <div
      className={`secret final${confirmed ? " secret--joined" : ""}${closing ? " secret--closing" : ""}`}
      onTransitionEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.propertyName === "opacity" &&
          closing
        ) {
          onClose()
        }
      }}
    >
      <div className="secret__veil" />
      <div className="secret__texture" />
      <img className="secret__logo" src={logo} alt="Кинопоиск" />

      <div className="secret__body">
        <img className="secret__prize" src={picture} alt="" />
        <div className="secret__copy">
          <h1 className="secret__title">
            {formatNbsp(confirmed ? "Вы участвуете в главном розыгрыше!" : `Сегодня разыгрываем ${prize}!`)}
          </h1>
          <p className="secret__text">
            {formatNbsp(
              confirmed
                ? `Вы участвуете в главном розыгрыше! Итоги — ${when}. После розыгрыша в Telegram придет уведомление`
                : `Сегодня — главный розыгрыш месяца! За каждый новый день участия в декабрьских розыгрышах вы получали дополнительный шанс на ${prize}. Чем больше дней участвовали, тем выше шанс выиграть. Итоги — ${when}`,
            )}
          </p>
        </div>
      </div>

      <div className="secret__footer">
        {error && <p className="secret__error">{error}</p>}
        <div className="secret__status">
          <div className="secret__status-copy">
            <p>Вы участвуете!</p>
            <span>{resultsLabel}</span>
          </div>
          <img src={hlop} alt="" />
        </div>
        {confirmed ? (
          <Button variant="secondary" onClick={close}>К календарю</Button>
        ) : (
          <div className="final__actions">
            <Button onClick={join} loading={joining}>Участвовать</Button>
            <Button variant="secondary" onClick={() => onRules?.()} disabled={joining}>
              Правила розыгрыша
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default FinalGift
