import "./Loading.scss"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import appRoutes from "../../routes/routes"
import Loader from "../Loader/Loader"
import { preloadImageSrcs } from "../../utils/preload"
import { APP_PRELOAD_IMAGES } from "../../data/preloadImages"
import { getTelegramInitData } from "../../api/telegramAuth"
import { ApiError } from "../../api/client"
import { openApp } from "../../api/advent"
import type { AdventUser } from "../../api/types"
import { prepareDay, setAdventSession, type AdventPhase } from "../../advent/session"
import { initTelegramPlatformAndSafeArea, isMobileTelegram } from "../../utils/telegramPlatform"

const MIN_LOADING_DELAY = 3000

const delay = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })

function Loading() {
  const isMobile = isMobileTelegram()
  const navigate = useNavigate()

  useEffect(() => {
    let navigated = false
    let cancelled = false

    const tg = window.Telegram?.WebApp
    tg?.ready?.()

    const go = () => {
      if (navigated || cancelled) return
      navigated = true
      navigate({ pathname: appRoutes.GAME, search: window.location.search }, { replace: true })
    }

    const finish = (phase: AdventPhase, extra?: { botUrl?: string; user?: AdventUser | null }) => {
      setAdventSession({
        live: false,
        phase,
        days: [],
        botUrl: extra?.botUrl ?? "",
        user: extra?.user ?? null,
      })
      go()
    }

    try {
      const platform: string | undefined = tg?.platform
      if (
        platform === "android" ||
        platform === "ios" ||
        platform === "android_x" ||
        platform === "unigram"
      ) {
        tg?.requestFullscreen?.()
        tg?.lockOrientation?.()
      } else if (
        platform === "tdesktop" ||
        platform === "weba" ||
        platform === "webk" ||
        platform === "unknown"
      ) {
        tg?.exitFullscreen?.()
        tg?.setMinimumHeight?.(700)
      }
      tg?.expand?.()
    } catch {
      tg?.expand?.()
    }
    try {
      tg?.disableVerticalSwipes?.()
    } catch {
      // Telegram Desktop does not implement every WebApp method.
    }

    initTelegramPlatformAndSafeArea()

    tg?.setHeaderColor?.("#f3f9ff")
    tg?.setBackgroundColor?.("#f3f9ff")
    tg?.setBottomBarColor?.("#f3f9ff")

    const preloadImages = async () => {
      try {
        const results = await preloadImageSrcs(APP_PRELOAD_IMAGES)
        const failedImages = results.filter((result) => !result.ok).map((result) => result.src)
        if (failedImages.length) console.warn("[preload] failed images:", failedImages)
      } catch (err) {
        console.warn("[preload] error during image preloading:", err)
      }
    }

    const init = async () => {
      if (!getTelegramInitData()) {
        console.error("Telegram initData is empty")
        return
      }

      const minDelay = delay(MIN_LOADING_DELAY)
      const preload = preloadImages()
      const userData = openApp()
      const [userDataResult] = await Promise.allSettled([userData, preload, minDelay])
      if (cancelled) return

      if (userDataResult.status !== "fulfilled") {
        const reason = userDataResult.reason
        if (reason instanceof ApiError && reason.http === 401) finish("auth")
        else if (reason instanceof ApiError && reason.http === 403) finish("subscribe")
        else finish("error")
        return
      }

      const data = userDataResult.value
      if (!data.subscribed) {
        finish("subscribe", { botUrl: data.bot_url, user: data.user })
        return
      }

      setAdventSession({
        live: true,
        phase: "ready",
        days: data.days.map(prepareDay),
        botUrl: data.bot_url,
        user: data.user,
      })
      go()
    }

    void init()

    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div
      className={`loading ${isMobile ? "loading--mobile" : "loading--desktop"}`}
      data-platform={isMobile ? "mobile" : "desktop"}
    >
      <div className="loading__content">
        <div className="loading__content_bot">
          <Loader />
        </div>
      </div>
    </div>
  )
}

export default Loading
