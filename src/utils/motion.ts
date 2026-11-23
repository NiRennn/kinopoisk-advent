import gsap from "gsap"

const OUT = "power3.out"
const IN = "power2.in"

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function fadeIn(root: HTMLElement) {
  if (reducedMotion()) {
    gsap.set(root, { autoAlpha: 1 })
    return gsap.timeline()
  }
  return gsap.fromTo(
    root,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.5, ease: "power2.out" },
  )
}

export function fadeOut(root: HTMLElement, done: () => void) {
  root.style.pointerEvents = "none"
  if (reducedMotion()) {
    done()
    return
  }
  gsap.to(root, {
    autoAlpha: 0,
    duration: 0.42,
    ease: "power2.inOut",
    onComplete: done,
  })
}

export function sheetIn(root: HTMLElement, card: HTMLElement) {
  if (reducedMotion()) {
    gsap.set(root, { autoAlpha: 1 })
    gsap.set(card, { y: 0 })
    return gsap.timeline()
  }
  gsap.set(root, { autoAlpha: 0 })
  gsap.set(card, { y: 72 })
  return gsap
    .timeline()
    .to(root, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0)
    .to(card, { y: 0, duration: 0.72, ease: OUT }, 0)
}

export function sheetOut(root: HTMLElement, card: HTMLElement, done: () => void) {
  root.style.pointerEvents = "none"
  if (reducedMotion()) {
    done()
    return
  }
  gsap
    .timeline({ onComplete: done })
    .to(card, { y: 56, duration: 0.42, ease: IN }, 0)
    .to(root, { autoAlpha: 0, duration: 0.36, ease: IN }, 0.06)
}

export function plaques(
  toast: HTMLElement | null,
  status: HTMLElement | null,
  joined: boolean,
) {
  if (toast) {
    gsap.killTweensOf(toast)
    const pose = { xPercent: -50, y: joined ? 0 : -22, autoAlpha: joined ? 1 : 0 }
    if (reducedMotion() || !joined) gsap.set(toast, pose)
    else gsap.to(toast, { ...pose, duration: 0.6, ease: OUT })
  }
  if (status) {
    gsap.killTweensOf(status)
    const pose = joined
      ? { autoAlpha: 1, y: 0, height: "auto", marginBottom: 12, paddingTop: 13, paddingBottom: 13 }
      : { autoAlpha: 0, y: 18, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }
    if (reducedMotion() || !joined) gsap.set(status, pose)
    else gsap.to(status, { ...pose, duration: 0.62, ease: OUT })
  }
}

export function hint(el: HTMLElement, visible: boolean) {
  gsap.killTweensOf(el)
  if (reducedMotion()) {
    gsap.set(el, { autoAlpha: visible ? 1 : 0, y: 0, scale: 1 })
    return
  }
  if (visible) {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: -14, scale: 0.94 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: OUT },
    )
    return
  }
  gsap.to(el, { autoAlpha: 0, y: -8, scale: 0.98, duration: 0.28, ease: IN })
}
