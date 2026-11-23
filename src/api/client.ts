import { getTelegramInitData } from "./telegramAuth"

const envUrl = import.meta.env.VITE_API_URL?.trim()

export const API_ORIGIN = (
  envUrl || (import.meta.env.DEV ? "https://tma-advent.brand-games.ru" : "")
).replace(/\/$/, "")

export class ApiError extends Error {
  http: number
  code?: string

  constructor(http: number, code?: string) {
    super(code ?? `HTTP ${http}`)
    this.name = "ApiError"
    this.http = http
    this.code = code
  }
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`
}

export async function api<T>(
  path: string,
  { method = "GET", body }: { method?: string; body?: unknown } = {},
): Promise<T> {
  const initData = getTelegramInitData()
  if (!initData) throw new ApiError(401)

  const headers: Record<string, string> = {
    Authorization: `tma ${initData}`,
  }
  if (body !== undefined) headers["Content-Type"] = "application/json"

  let response: Response
  try {
    response = await fetch(`${API_ORIGIN}/api/${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, "network")
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) throw new ApiError(response.status, data.error)
  return data as T
}
