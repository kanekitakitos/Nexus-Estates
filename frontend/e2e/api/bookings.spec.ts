import { expect, test } from "@playwright/test"
import { apiBaseURL, authHeaders, expectStatus, readJson, registerOwner, uniqueSuffix } from "./helpers"

type ApiResponse<T> = { success: boolean; data: T }

type BookingResponse = {
  id: number
  propertyId: number
  userId?: number
  checkInDate: string
  checkOutDate: string
  guestCount: number
  status?: string
}

type ErrorBody = { message?: string; error?: string; status?: number }

function isoDatePlusDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function buildCreatePropertyPayload(suffix: string) {
  return {
    title: `E2E Booking Property ${suffix}`,
    description: { pt: `Descrição ${suffix}` },
    price: 80.0,
    ownerId: null,
    location: "E2E Booking Location",
    city: "E2E Booking City",
    address: `Rua Booking ${suffix}`,
    maxGuests: 3,
    amenityIds: [],
    imageUrl: "",
  }
}

test.describe.serial("API • Bookings (criação + conflitos + leitura)", () => {
  test("sem token: /bookings/me devolve 401", async ({ request }) => {
    const res = await request.get(`${apiBaseURL()}/bookings/me`)
    expect(res.status()).toBe(401)
  })

  test("criar booking e bloquear overlap (409)", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createPropertyRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createPropertyRes, 201, "properties:create(for booking)")
    const createdPropertyJson = await readJson<ApiResponse<{ id: number }>>(createPropertyRes)
    const propertyId = createdPropertyJson.data.id
    expect(propertyId).toBeTruthy()

    const checkInDate = isoDatePlusDays(1)
    const checkOutDate = isoDatePlusDays(3)

    const createBookingRes = await request.post(`${apiBaseURL()}/bookings`, {
      headers: authHeaders(owner),
      data: { propertyId, checkInDate, checkOutDate, guestCount: 2, guestEmail: "e2e_guest@nexus-estates.local" },
    })
    await expectStatus(createBookingRes, 201, "bookings:create")
    const booking = await readJson<BookingResponse>(createBookingRes)
    expect(booking.id).toBeTruthy()
    expect(booking.propertyId).toBe(propertyId)

    const conflictRes = await request.post(`${apiBaseURL()}/bookings`, {
      headers: authHeaders(owner),
      data: { propertyId, checkInDate, checkOutDate, guestCount: 2, guestEmail: "e2e_guest@nexus-estates.local" },
    })
    await expectStatus(conflictRes, 409, "bookings:conflict")

    const getRes = await request.get(`${apiBaseURL()}/bookings/${booking.id}`, { headers: authHeaders(owner) })
    await expectStatus(getRes, 200, "bookings:get")
    const fetched = await readJson<BookingResponse>(getRes)
    expect(fetched.id).toBe(booking.id)

    const byPropertyRes = await request.get(`${apiBaseURL()}/bookings/property/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(byPropertyRes, 200, "bookings:byProperty")
    const byProperty = await readJson<BookingResponse[]>(byPropertyRes)
    expect(byProperty.some((b) => b.id === booking.id)).toBeTruthy()
  })

  test("validação: datas inválidas devolvem 400", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createPropertyRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createPropertyRes, 201, "properties:create(for invalid booking)")
    const createdPropertyJson = await readJson<ApiResponse<{ id: number }>>(createPropertyRes)
    const propertyId = createdPropertyJson.data.id

    const checkInDate = isoDatePlusDays(5)
    const checkOutDate = isoDatePlusDays(5)

    const res = await request.post(`${apiBaseURL()}/bookings`, {
      headers: authHeaders(owner),
      data: { propertyId, checkInDate, checkOutDate, guestCount: 1, guestEmail: "e2e_guest@nexus-estates.local" },
    })
    expect(res.status()).toBe(400)
  })

  test("validação: guestCount acima de maxGuests devolve 400 (RuleViolation)", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createPropertyRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createPropertyRes, 201, "properties:create(for too many guests)")
    const createdPropertyJson = await readJson<ApiResponse<{ id: number }>>(createPropertyRes)
    const propertyId = createdPropertyJson.data.id

    const checkInDate = isoDatePlusDays(10)
    const checkOutDate = isoDatePlusDays(12)

    const res = await request.post(`${apiBaseURL()}/bookings`, {
      headers: authHeaders(owner),
      data: { propertyId, checkInDate, checkOutDate, guestCount: 99, guestEmail: "e2e_guest@nexus-estates.local" },
    })
    expect(res.status()).toBe(400)
    const body = await readJson<ErrorBody>(res)
    expect(body.message).toBeTruthy()
  })

  test("blocks: criar bloqueio impede booking overlap (409) e aparece em /byProperty", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createPropertyRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createPropertyRes, 201, "properties:create(for block)")
    const createdPropertyJson = await readJson<ApiResponse<{ id: number }>>(createPropertyRes)
    const propertyId = createdPropertyJson.data.id

    const checkInDate = isoDatePlusDays(15)
    const checkOutDate = isoDatePlusDays(17)

    const blockRes = await request.post(`${apiBaseURL()}/bookings/blocks`, {
      headers: authHeaders(owner),
      data: { propertyId, checkInDate, checkOutDate, reason: "E2E maintenance" },
    })
    await expectStatus(blockRes, 201, "bookings:block:create")
    const block = await readJson<BookingResponse>(blockRes)
    expect(block.status).toBe("BLOCKED")

    const conflictRes = await request.post(`${apiBaseURL()}/bookings`, {
      headers: authHeaders(owner),
      data: { propertyId, checkInDate, checkOutDate, guestCount: 1, guestEmail: "e2e_guest@nexus-estates.local" },
    })
    await expectStatus(conflictRes, 409, "bookings:conflict(block overlap)")

    const byPropertyRes = await request.get(`${apiBaseURL()}/bookings/property/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(byPropertyRes, 200, "bookings:byProperty(with block)")
    const byProperty = await readJson<BookingResponse[]>(byPropertyRes)
    expect(byProperty.some((b) => b.id === block.id)).toBeTruthy()
  })

  test("/bookings/me devolve as reservas do utilizador autenticado", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createPropertyRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createPropertyRes, 201, "properties:create(for bookings/me)")
    const createdPropertyJson = await readJson<ApiResponse<{ id: number }>>(createPropertyRes)
    const propertyId = createdPropertyJson.data.id

    const checkInDate = isoDatePlusDays(20)
    const checkOutDate = isoDatePlusDays(22)

    const createBookingRes = await request.post(`${apiBaseURL()}/bookings`, {
      headers: authHeaders(owner),
      data: { propertyId, checkInDate, checkOutDate, guestCount: 1, guestEmail: "e2e_guest@nexus-estates.local" },
    })
    await expectStatus(createBookingRes, 201, "bookings:create(for me)")
    const booking = await readJson<BookingResponse>(createBookingRes)

    const meRes = await request.get(`${apiBaseURL()}/bookings/me`, { headers: authHeaders(owner) })
    await expectStatus(meRes, 200, "bookings:me")
    const mine = await readJson<BookingResponse[]>(meRes)
    expect(mine.some((b) => b.id === booking.id)).toBeTruthy()
  })
})
