import { useState } from "react"
import { createPortal } from "react-dom"
import "./ShareTrial.scss"
import Button from "../Button/Button"
import bolt from "../../assets/icons/bolt.svg"
import copy from "../../assets/icons/copy.svg"
import cross from "../../assets/icons/cross.svg"

const TRIAL_CODE = "SADGADHF67"
const TRIAL_TEXT =
  "Спасибо, что ты уже с нами! А этот триал — для кого-то из твоих близких, с кем будет классно смотреть спорт в новом году"

type ShareTrialProps = {
  onClose: () => void
}

function shareTrial() {
  const text = `Триал для близкого\n${TRIAL_TEXT}\n${TRIAL_CODE}`
  const link = `https://t.me/share/url?text=${encodeURIComponent(text)}`
  const tg = window.Telegram?.WebApp
  if (typeof tg?.openTelegramLink === "function") tg.openTelegramLink(link)
  else window.open(link, "_blank", "noopener")
}

function ShareTrial({ onClose }: ShareTrialProps) {
  const [closing, setClosing] = useState(false)
  const [copied, setCopied] = useState(false)

  const close = () => {
    if (closing) return
    setClosing(true)
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(TRIAL_CODE)
    } catch {
      const input = document.createElement("textarea")
      input.value = TRIAL_CODE
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      input.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return createPortal(
    <div
      className={`share${closing ? " share--closing" : ""}`}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === "overlay-out" && closing) onClose()
      }}
    >
      <button type="button" className="share__veil" aria-label="Закрыть" onClick={close} />
      <div className="share__card">
        <button type="button" className="share__close" aria-label="Закрыть" onClick={close}>
          <img src={cross} alt="" />
        </button>
        <div className="share__body">
          <img className="share__bolt" src={bolt} alt="" />
          <h2>Триал для близкого</h2>
          <p>{TRIAL_TEXT}</p>
        </div>
        <div className="share__code">
          <span>{copied ? "Скопировано" : TRIAL_CODE}</span>
          <button type="button" aria-label="Скопировать код" onClick={copyCode}>
            <img src={copy} alt="" />
          </button>
        </div>
        <Button onClick={shareTrial}>Поделиться триалом</Button>
      </div>
    </div>,
    document.body,
  )
}

export default ShareTrial
