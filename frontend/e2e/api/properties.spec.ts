import { expect, test } from "@playwright/test"
import { apiBaseURL, authHeaders, expectStatus, readJson, registerGuest, registerOwner, uniqueSuffix } from "./helpers"

type ApiResponse<T> = { success: boolean; message?: string; data: T }
type Property = { id: number; title?: string; name?: string; city?: string; location?: string; address?: string }
type Quote = { valid: boolean; totalPrice?: number | string | null; currency?: string | null; validationErrors?: string[] }

function buildCreatePropertyPayload(suffix: string) {
  return {
    title: `E2E Property ${suffix}`,
    description: { pt: `Descrição ${suffix}` },
    price: 123.45,
    ownerId: null,
    location: "E2E Location",
    city: "E2E City",
    address: `Rua E2E ${suffix}`,
    maxGuests: 2,
    amenityIds: [],
    imageUrl: "",
  }
}

test.describe.serial("API • Propriedades (CRUD + permissões)", () => {
  test("search público funciona sem autenticação", async ({ request }) => {
    const res = await request.get(`${apiBaseURL()}/properties/search`)
    await expectStatus(res, 200, "properties:search")
    const json = await readJson<ApiResponse<unknown>>(res)
    expect(json.success).toBeTruthy()
    expect(Array.isArray(json.data)).toBeTruthy()
  })

  test("OWNER: criar → patch → expanded → history → delete", async ({ request }) => {
    const { session: owner } = await registerOwner(request)

    const suffix = uniqueSuffix()
    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    expect(createdJson.success).toBeTruthy()
    const propertyId = createdJson.data.id
    expect(propertyId).toBeTruthy()

    const patchRes = await request.patch(`${apiBaseURL()}/properties/${propertyId}`, {
      headers: authHeaders(owner),
      data: { title: `E2E Property Patched ${suffix}`, isActive: true },
    })
    await expectStatus(patchRes, 200, "properties:patch")
    const patchedJson = await readJson<ApiResponse<{ id: number; title?: string; isActive?: boolean }>>(patchRes)
    expect(patchedJson.success).toBeTruthy()
    expect(patchedJson.data.id).toBe(propertyId)

    const expandedRes = await request.get(`${apiBaseURL()}/properties/${propertyId}/expanded`, {
      headers: authHeaders(owner),
    })
    await expectStatus(expandedRes, 200, "properties:expanded")
    const expandedJson = await readJson<ApiResponse<{ property?: { id?: number } }>>(expandedRes)
    expect(expandedJson.success).toBeTruthy()

    const historyRes = await request.get(`${apiBaseURL()}/properties/${propertyId}/history`, {
      headers: authHeaders(owner),
    })
    await expectStatus(historyRes, 200, "properties:history")
    const historyJson = await readJson<ApiResponse<unknown[]>>(historyRes)
    expect(historyJson.success).toBeTruthy()
    expect(Array.isArray(historyJson.data)).toBeTruthy()

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete")

    const afterDeleteRes = await request.get(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    expect(afterDeleteRes.status()).toBe(404)
  })

  test("quote: devolve valid=true e preço para estadia válida", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(quote)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const checkInDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const checkOutDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const quoteRes = await request.post(`${apiBaseURL()}/properties/${propertyId}/quote`, {
      headers: authHeaders(owner),
      data: { checkInDate, checkOutDate, guestCount: 2 },
    })
    await expectStatus(quoteRes, 200, "properties:quote(valid)")
    const quoteJson = await readJson<ApiResponse<Quote>>(quoteRes)
    expect(quoteJson.success).toBeTruthy()
    expect(quoteJson.data.valid).toBeTruthy()
    expect(quoteJson.data.currency).toBeTruthy()
    expect(quoteJson.data.totalPrice).toBeTruthy()

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(quote)")
  })

  test("quote: devolve valid=false quando guestCount excede maxGuests", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(quote invalid)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const checkInDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const checkOutDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const quoteRes = await request.post(`${apiBaseURL()}/properties/${propertyId}/quote`, {
      headers: authHeaders(owner),
      data: { checkInDate, checkOutDate, guestCount: 99 },
    })
    await expectStatus(quoteRes, 200, "properties:quote(invalid)")
    const quoteJson = await readJson<ApiResponse<Quote>>(quoteRes)
    expect(quoteJson.success).toBeTruthy()
    expect(quoteJson.data.valid).toBeFalsy()
    expect(Array.isArray(quoteJson.data.validationErrors)).toBeTruthy()
    expect((quoteJson.data.validationErrors || []).length).toBeGreaterThan(0)

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(quote invalid)")
  })

  test("upload params: sem token 401; GUEST 403; OWNER 200", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const { session: guest } = await registerGuest(request)

    const anonymousRes = await request.get(`${apiBaseURL()}/properties/upload-params`)
    expect(anonymousRes.status()).toBe(401)

    const guestRes = await request.get(`${apiBaseURL()}/properties/upload-params`, { headers: authHeaders(guest) })
    expect(guestRes.status()).toBe(403)

    const ownerRes = await request.get(`${apiBaseURL()}/properties/upload-params`, { headers: authHeaders(owner) })
    await expectStatus(ownerRes, 200, "properties:upload-params")
    const ownerJson = await readJson<ApiResponse<Record<string, unknown>>>(ownerRes)
    expect(ownerJson.success).toBeTruthy()
    expect(typeof ownerJson.data).toBe("object")
  })

  test("documents upload params: sem token 401; GUEST 403; OWNER 200", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const { session: guest } = await registerGuest(request)
    const suffix = uniqueSuffix()

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(docs upload)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const anonymousRes = await request.get(`${apiBaseURL()}/properties/${propertyId}/documents/upload-params`)
    expect(anonymousRes.status()).toBe(401)

    const guestRes = await request.get(`${apiBaseURL()}/properties/${propertyId}/documents/upload-params`, { headers: authHeaders(guest) })
    expect(guestRes.status()).toBe(403)

    const ownerRes = await request.get(`${apiBaseURL()}/properties/${propertyId}/documents/upload-params`, { headers: authHeaders(owner) })
    await expectStatus(ownerRes, 200, "properties:documents:upload-params")
    const ownerJson = await readJson<ApiResponse<Record<string, unknown>>>(ownerRes)
    expect(ownerJson.success).toBeTruthy()
    expect(ownerJson.data.context_property_id).toBe(propertyId)

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(docs upload)")
  })

  test("GUEST: patch propriedade devolve 403", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const { session: guest } = await registerGuest(request)

    const suffix = uniqueSuffix()
    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(forbidden)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const patchRes = await request.patch(`${apiBaseURL()}/properties/${propertyId}`, {
      headers: authHeaders(guest),
      data: { title: `E2E Forbidden Patch ${suffix}` },
    })
    expect(patchRes.status()).toBe(403)
  })
})
