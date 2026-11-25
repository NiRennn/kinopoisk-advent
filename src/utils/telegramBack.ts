import { useEffect, useRef } from "react"

type BackButton = {
  show: () => void
  hide: () => void
  onClick: (handler: () => void) => void
  offClick: (handler: () => void) => void
}

type Entry = { id: number; close: () => void }

let nextId = 0
let stack: Entry[] = []
let listening = false

function backButton(): BackButton | null {
  const back = window.Telegram?.WebApp?.BackButton
  if (!back?.show || !back?.hide || !back?.onClick || !back?.offClick) return null
  return back
}

function onTelegramBack() {
  stack[stack.length - 1]?.close()
}

function sync() {
  const back = backButton()
  if (!back) return
  if (!listening) {
    back.onClick(onTelegramBack)
    listening = true
  }
  if (stack.length) back.show()
  else back.hide()
}

function bindTelegramBack(close: () => void) {
  const id = ++nextId
  stack = [...stack, { id, close }]
  sync()
  return () => {
    stack = stack.filter((item) => item.id !== id)
    sync()
  }
}

export function useTelegramBackButton(onBack: () => void) {
  const onBackRef = useRef(onBack)
  onBackRef.current = onBack

  useEffect(() => bindTelegramBack(() => onBackRef.current()), [])
}
