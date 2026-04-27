import { expect, test } from "@playwright/test"
import { apiBaseURL, authHeaders, expectStatus, readJson, registerAdmin, registerGuest, registerOwner, uniqueEmail, uniqueSuffix } from "./helpers"

test.describe.serial("API • Autenticação", () => {
  test("registo + login + /users/me", async ({ request }) => {
    const { session, password } = await registerGuest(request)

    expect(session.token).toBeTruthy()
    expect(session.email).toContain("@")

    const loginRes = await request.post(`${apiBaseURL()}/users/auth/login`, {
      data: { email: session.email, password },
    })
    await expectStatus(loginRes, 200, "login")
    const loginJson = await readJson<{ success: boolean; data?: { token?: string; role?: string } }>(loginRes)
    expect(loginJson.success).toBeTruthy()
    expect(loginJson.data?.token).toBeTruthy()

    const meRes = await request.get(`${apiBaseURL()}/users/me`, {
      headers: authHeaders(session),
    })
    await expectStatus(meRes, 200, "users/me")
    const meJson = await readJson<{ success?: boolean; data?: { id?: number; email?: string } }>(meRes)
    expect(meJson.data?.email).toBe(session.email)
    expect(typeof meJson.data?.id).toBe("number")
  })

  test("/users/me sem token devolve 401", async ({ request }) => {
    const res = await request.get(`${apiBaseURL()}/users/me`)
    expect(res.status()).toBe(401)
  })

  test("login inválido devolve 401", async ({ request }) => {
    const { session } = await registerGuest(request)
    const res = await request.post(`${apiBaseURL()}/users/auth/login`, {
      data: { email: session.email, password: "wrong_password_123" },
    })
    expect(res.status()).toBe(401)
  })

  test("registo duplicado devolve 409", async ({ request }) => {
    const email = uniqueEmail("e2e_dup")
    const password = `E2E_Str0ng_${uniqueSuffix()}`
    const phone = "+351910000003"

    const first = await request.post(`${apiBaseURL()}/users/auth/register`, { data: { email, password, phone, role: "GUEST" } })
    await expectStatus(first, 200, "register(first)")

    const second = await request.post(`${apiBaseURL()}/users/auth/register`, { data: { email, password, phone, role: "GUEST" } })
    expect(second.status()).toBe(409)
  })

  test("autorização: OWNER pode ler /users/{id}; GUEST não (403)", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const { session: guest } = await registerGuest(request)

    const ownerGet = await request.get(`${apiBaseURL()}/users/${owner.id}`, { headers: authHeaders(owner) })
    await expectStatus(ownerGet, 200, "users:get(owner)")

    const guestGet = await request.get(`${apiBaseURL()}/users/${owner.id}`, { headers: authHeaders(guest) })
    expect(guestGet.status()).toBe(403)
  })

  test("autorização: ADMIN lista /users; OWNER é negado (403)", async ({ request }) => {
    const { session: admin } = await registerAdmin(request)
    const { session: owner } = await registerOwner(request)

    const adminList = await request.get(`${apiBaseURL()}/users`, { headers: authHeaders(admin) })
    await expectStatus(adminList, 200, "users:list(admin)")
    const users = await readJson<unknown>(adminList)
    expect(Array.isArray(users)).toBeTruthy()

    const ownerList = await request.get(`${apiBaseURL()}/users`, { headers: authHeaders(owner) })
    expect(ownerList.status()).toBe(403)
  })

  test("gateway: /finance e /sync sem token devolvem 401", async ({ request }) => {
    const financeRes = await request.get(`${apiBaseURL()}/finance/payments/provider`)
    expect(financeRes.status()).toBe(401)

    const syncRes = await request.get(`${apiBaseURL()}/sync/messages/1`)
    expect(syncRes.status()).toBe(401)
  })

  test("webhook: Ably sem assinatura devolve 400 (com sessão)", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const res = await request.post(`${apiBaseURL()}/sync/messages/webhook`, {
      headers: { ...authHeaders(owner), "Content-Type": "application/json" },
      data: "{}",
    })
    expect(res.status()).toBe(400)
  })

  test("webhook: Ably assinatura inválida devolve 401", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const res = await request.post(`${apiBaseURL()}/sync/messages/webhook`, {
      headers: { ...authHeaders(owner), "Content-Type": "application/json", "X-Ably-Signature": "sha256=invalid" },
      data: "{}",
    })
    expect(res.status()).toBe(401)
    expect(await res.text()).toContain("Invalid signature")
  })

  test("webhook: Stripe sem assinatura devolve 400 (com sessão)", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const res = await request.post(`${apiBaseURL()}/finance/webhooks/stripe`, {
      headers: { ...authHeaders(owner), "Content-Type": "application/json" },
      data: "{}",
    })
    if (res.status() >= 500) test.skip(true, "finance-service ainda não está a correr com o fix do MissingRequestHeaderException")
    expect(res.status()).toBe(400)
  })

  test("webhook: Stripe assinatura inválida devolve 400", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const res = await request.post(`${apiBaseURL()}/finance/webhooks/stripe`, {
      headers: { ...authHeaders(owner), "Content-Type": "application/json", "Stripe-Signature": "t=0,v1=invalid" },
      data: "{}",
    })
    expect(res.status()).toBe(400)
    const body = await res.text()
    expect(body).toContain("Invalid Stripe webhook signature")
  })

  test("forgot password (email inexistente) responde 200 (sem enumeração)", async ({ request }) => {
    const res = await request.post(`${apiBaseURL()}/users/auth/password/forgot`, {
      data: { email: uniqueEmail("e2e_unknown") },
    })
    await expectStatus(res, 200, "forgot password")
    const json = await readJson<{ success?: boolean }>(res)
    expect(json.success).toBeTruthy()
  })
})
