import type { APIRequestContext, APIResponse } from "@playwright/test"

type ApiResponse<T> = { success: boolean; message?: string; data: T }

export type Session = { token: string; id: number; email: string; role: string }

export async function expectStatus(res: APIResponse, expected: number | number[], context?: string): Promise<void> {
  const expectedList = Array.isArray(expected) ? expected : [expected]
  const status = res.status()
  if (expectedList.includes(status)) return

  const body = await res.text()
  const hint = context ? ` (${context})` : ""
  throw new Error(`Status inesperado${hint}: esperado=${expectedList.join("|")} recebido=${status} body=${body.slice(0, 4000)}`)
}

export function parsePossiblyDirtyJson(text: string): unknown {
  const trimmed = text.trim()
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed)
  } catch {
    const firstBrace = trimmed.indexOf("{")
    const firstBracket = trimmed.indexOf("[")
    const startCandidates = [firstBrace, firstBracket].filter((v) => v >= 0)
    if (startCandidates.length === 0) throw new Error(`Resposta não é JSON: ${trimmed.slice(0, 200)}`)
    const start = Math.min(...startCandidates)

    let inString = false
    let escape = false
    const stack: string[] = []

    for (let i = start; i < trimmed.length; i++) {
      const ch = trimmed[i]

      if (inString) {
        if (escape) {
          escape = false
          continue
        }
        if (ch === "\\") {
          escape = true
          continue
        }
        if (ch === "\"") {
          inString = false
        }
        continue
      }

      if (ch === "\"") {
        inString = true
        continue
      }

      if (ch === "{" || ch === "[") {
        stack.push(ch)
        continue
      }

      if (ch === "}" || ch === "]") {
        const last = stack.pop()
        const ok =
          (ch === "}" && last === "{") ||
          (ch === "]" && last === "[")
        if (!ok) {
          throw new Error(`Resposta JSON inválida: ${trimmed.slice(0, 200)}`)
        }
        if (stack.length === 0) {
          const candidate = trimmed.slice(start, i + 1)
          return JSON.parse(candidate)
        }
      }
    }

    throw new Error(`Resposta JSON inválida: ${trimmed.slice(0, 200)}`)
  }
}

export async function readJson<T = unknown>(res: APIResponse): Promise<T> {
  const text = await res.text()
  return parsePossiblyDirtyJson(text) as T
}

export function apiBaseURL(): string {
  return process.env.E2E_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api"
}

export function authHeaders(session: Session): Record<string, string> {
  return {
    Authorization: `Bearer ${session.token}`,
    "X-User-Id": String(session.id),
    "X-User-Email": session.email,
    "X-User-Role": session.role,
  }
}

export function uniqueSuffix(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function uniqueEmail(prefix = "e2e"): string {
  const raw = `${prefix}_${uniqueSuffix()}@nexus-estates.local`
  return raw.toLowerCase()
}

export async function register(request: APIRequestContext, payload: { email: string; password: string; phone: string; role?: string }): Promise<Session> {
  const res = await request.post(`${apiBaseURL()}/users/auth/register`, { data: payload })
  await expectStatus(res, 200, "register")
  const json = (await readJson<ApiResponse<Session>>(res)) as ApiResponse<Session>

  if (!json?.success || !json.data?.token) {
    throw new Error(`Falha no registo: body=${JSON.stringify(json)}`)
  }
  return json.data
}

export async function login(request: APIRequestContext, payload: { email: string; password: string }): Promise<Session> {
  const res = await request.post(`${apiBaseURL()}/users/auth/login`, { data: payload })
  await expectStatus(res, 200, "login")
  const json = (await readJson<ApiResponse<Session>>(res)) as ApiResponse<Session>

  if (!json?.success || !json.data?.token) {
    throw new Error(`Falha no login: body=${JSON.stringify(json)}`)
  }
  return json.data
}

export async function registerOwner(request: APIRequestContext): Promise<{ session: Session; password: string }> {
  const email = uniqueEmail("e2e_owner")
  const password = `E2E_Str0ng_${uniqueSuffix()}`
  const phone = "+351910000000"
  const session = await register(request, { email, password, phone, role: "OWNER" })
  return { session, password }
}

export async function registerGuest(request: APIRequestContext): Promise<{ session: Session; password: string }> {
  const email = uniqueEmail("e2e_guest")
  const password = `E2E_Str0ng_${uniqueSuffix()}`
  const phone = "+351910000001"
  const session = await register(request, { email, password, phone, role: "GUEST" })
  return { session, password }
}

export async function registerAdmin(request: APIRequestContext): Promise<{ session: Session; password: string }> {
  const email = uniqueEmail("e2e_admin")
  const password = `E2E_Str0ng_${uniqueSuffix()}`
  const phone = "+351910000002"
  const session = await register(request, { email, password, phone, role: "ADMIN" })
  return { session, password }
}
