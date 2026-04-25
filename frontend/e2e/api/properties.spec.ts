import { expect, test } from "@playwright/test"
import type { APIRequestContext } from "@playwright/test"
import { apiBaseURL, authHeaders, expectStatus, readJson, registerGuest, registerOwner, uniqueSuffix } from "./helpers"

type ApiResponse<T> = { success: boolean; message?: string; data: T }
type Property = { id: number; title?: string; name?: string; city?: string; location?: string; address?: string }
type Quote = { valid: boolean; totalPrice?: number | string | null; currency?: string | null; validationErrors?: string[] }
type ExpandedProperty = {
  id: number
  name: string
  description: Record<string, string>
  location: string
  city: string
  address: string
  basePrice: number | string
  maxGuests: number
  isActive: boolean
  amenities: string[]
  rules: unknown
  seasonality: unknown[]
  imageUrl: string | null
}

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

function asString(v: unknown) {
  return v === null || v === undefined ? "" : String(v)
}

async function getExpanded(request: APIRequestContext, propertyId: number, headers?: Record<string, string>) {
  const expandedRes = await request.get(`${apiBaseURL()}/properties/${propertyId}/expanded`, headers ? { headers } : undefined)
  await expectStatus(expandedRes, 200, "properties:expanded")
  const expandedJson = await readJson<ApiResponse<ExpandedProperty>>(expandedRes)
  expect(expandedJson.success).toBeTruthy()
  return expandedJson.data
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

    const expanded = await getExpanded(request, propertyId, authHeaders(owner))
    expect(expanded.id).toBe(propertyId)
    expect(expanded.name).toBe(`E2E Property Patched ${suffix}`)
    expect(expanded.location).toBe("E2E Location")
    expect(expanded.city).toBe("E2E City")
    expect(expanded.address).toBe(`Rua E2E ${suffix}`)

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

  test("OWNER: patch atualiza todos os campos e mantém consistência em leituras", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(update-all)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const expected = {
      title: `E2E Updated ${suffix}`,
      description: { pt: `Descrição atualizada ${suffix}`, en: `Updated description ${suffix}` },
      location: `E2E Location ${suffix}`,
      city: `E2E City ${suffix}`,
      address: `Rua Atualizada ${suffix}`,
      basePrice: "199.99",
      maxGuests: 6,
      isActive: false,
      imageUrl: `https://example.com/e2e/${suffix}.jpg`,
    }

    const patchRes = await request.patch(`${apiBaseURL()}/properties/${propertyId}`, {
      headers: authHeaders(owner),
      data: {
        title: expected.title,
        description: expected.description,
        location: expected.location,
        city: expected.city,
        address: expected.address,
        basePrice: expected.basePrice,
        maxGuests: expected.maxGuests,
        isActive: expected.isActive,
        imageUrl: expected.imageUrl,
      },
    })
    await expectStatus(patchRes, 200, "properties:patch(update-all)")
    const patchedJson = await readJson<ApiResponse<ExpandedProperty>>(patchRes)
    expect(patchedJson.success).toBeTruthy()
    expect(patchedJson.data.id).toBe(propertyId)

    const expanded = await getExpanded(request, propertyId, authHeaders(owner))
    expect(expanded.id).toBe(propertyId)
    expect(expanded.name).toBe(expected.title)
    expect(expanded.description).toEqual(expected.description)
    expect(expanded.location).toBe(expected.location)
    expect(expanded.city).toBe(expected.city)
    expect(expanded.address).toBe(expected.address)
    expect(asString(expanded.basePrice)).toBe(expected.basePrice)
    expect(expanded.maxGuests).toBe(expected.maxGuests)
    expect(expanded.isActive).toBe(expected.isActive)
    expect(expanded.imageUrl).toBe(expected.imageUrl)

    const byIdRes = await request.get(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(byIdRes, 200, "properties:getById")
    const byIdJson = await readJson<ApiResponse<ExpandedProperty>>(byIdRes)
    expect(byIdJson.success).toBeTruthy()
    expect(byIdJson.data.id).toBe(propertyId)
    expect(byIdJson.data.name).toBe(expected.title)
    expect(asString(byIdJson.data.basePrice)).toBe(expected.basePrice)
    expect(byIdJson.data.maxGuests).toBe(expected.maxGuests)
    expect(byIdJson.data.isActive).toBe(expected.isActive)

    const listRes = await request.get(`${apiBaseURL()}/properties/search`)
    await expectStatus(listRes, 200, "properties:search(after update)")
    const listJson = await readJson<ApiResponse<Record<string, unknown>[]>>(listRes)
    expect(listJson.success).toBeTruthy()
    const found = (listJson.data || []).find((p) => Number(p.id) === propertyId)
    expect(found).toBeTruthy()
    expect(String(found?.name)).toBe(expected.title)
    expect(String(found?.city)).toBe(expected.city)
    expect(String(found?.location)).toBe(expected.location)
    expect(String(found?.address)).toBe(expected.address)
    expect(asString(found?.basePrice)).toBe(expected.basePrice)
    expect(Number(found?.maxGuests)).toBe(expected.maxGuests)
    expect(Boolean(found?.isActive)).toBe(expected.isActive)
    expect(String(found?.imageUrl)).toBe(expected.imageUrl)

    const historyRes = await request.get(`${apiBaseURL()}/properties/${propertyId}/history`, {
      headers: authHeaders(owner),
    })
    await expectStatus(historyRes, 200, "properties:history(update-all)")
    const historyJson = await readJson<ApiResponse<{ fieldName?: string }[]>>(historyRes)
    expect(historyJson.success).toBeTruthy()
    const fields = new Set((historyJson.data || []).map((h) => h.fieldName).filter(Boolean))
    ;["name", "description", "location", "city", "address", "basePrice", "maxGuests", "isActive", "imageUrl"].forEach((f) => {
      expect(fields.has(f)).toBeTruthy()
    })

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(update-all)")
  })

  test("OWNER: patch parcial não altera campos omitidos", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(partial patch)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const before = await getExpanded(request, propertyId, authHeaders(owner))

    const patchRes = await request.patch(`${apiBaseURL()}/properties/${propertyId}`, {
      headers: authHeaders(owner),
      data: { title: `E2E Only Title ${suffix}` },
    })
    await expectStatus(patchRes, 200, "properties:patch(partial)")

    const after = await getExpanded(request, propertyId, authHeaders(owner))
    expect(after.name).toBe(`E2E Only Title ${suffix}`)
    expect(after.description).toEqual(before.description)
    expect(after.location).toBe(before.location)
    expect(after.city).toBe(before.city)
    expect(after.address).toBe(before.address)
    expect(asString(after.basePrice)).toBe(asString(before.basePrice))
    expect(after.maxGuests).toBe(before.maxGuests)
    expect(after.isActive).toBe(before.isActive)
    expect(after.imageUrl).toBe(before.imageUrl)

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(partial patch)")
  })

  test("OWNER: validações no patch (title/basePrice/maxGuests) devolvem 400", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(patch validations)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const badTitle = await request.patch(`${apiBaseURL()}/properties/${propertyId}`, {
      headers: authHeaders(owner),
      data: { title: "aa" },
    })
    expect(badTitle.status()).toBe(400)

    const badPriceScale = await request.patch(`${apiBaseURL()}/properties/${propertyId}`, {
      headers: authHeaders(owner),
      data: { basePrice: "10.999" },
    })
    expect(badPriceScale.status()).toBe(400)

    const badPriceZero = await request.patch(`${apiBaseURL()}/properties/${propertyId}`, {
      headers: authHeaders(owner),
      data: { basePrice: "0.00" },
    })
    expect(badPriceZero.status()).toBe(400)

    const badGuests = await request.patch(`${apiBaseURL()}/properties/${propertyId}`, {
      headers: authHeaders(owner),
      data: { maxGuests: 0 },
    })
    expect(badGuests.status()).toBe(400)

    const expandedAfter = await getExpanded(request, propertyId, authHeaders(owner))
    expect(expandedAfter.id).toBe(propertyId)

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(patch validations)")
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
