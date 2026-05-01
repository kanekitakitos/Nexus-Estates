import { expect, test } from "@playwright/test"
import type { APIRequestContext } from "@playwright/test"
import { apiBaseURL, authHeaders, expectStatus, readJson, register, registerGuest, registerOwner, uniqueSuffix } from "./helpers"

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

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(forbidden)")
  })

  test("OWNER/MANAGER: confirmar regras, sazonalidade e permissões via endpoints dedicados", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const { session: manager } = await registerOwner(request)

    const suffix = uniqueSuffix()
    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(planB)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    expect(createdJson.success).toBeTruthy()
    const propertyId = createdJson.data.id

    const lookupRes = await request.get(`${apiBaseURL()}/users/lookup?email=${encodeURIComponent(manager.email)}`, {
      headers: authHeaders(owner),
    })
    await expectStatus(lookupRes, 200, "users:lookup")
    const lookupJson = await readJson<ApiResponse<{ id: number; email: string }>>(lookupRes)
    expect(lookupJson.success).toBeTruthy()
    expect(lookupJson.data.id).toBe(manager.id)
    expect(lookupJson.data.email).toBe(manager.email)

    const putPermsRes = await request.put(`${apiBaseURL()}/properties/${propertyId}/permissions`, {
      headers: authHeaders(owner),
      data: [
        { userId: owner.id, accessLevel: "PRIMARY_OWNER" },
        { userId: manager.id, accessLevel: "MANAGER" },
      ],
    })
    await expectStatus(putPermsRes, 200, "properties:permissions:put")
    const putPermsJson = await readJson<ApiResponse<Array<{ userId: number; accessLevel: string }>>>(putPermsRes)
    expect(putPermsJson.success).toBeTruthy()
    expect(Array.isArray(putPermsJson.data)).toBeTruthy()
    expect(putPermsJson.data.some((p) => p.userId === owner.id && p.accessLevel === "PRIMARY_OWNER")).toBeTruthy()
    expect(putPermsJson.data.some((p) => p.userId === manager.id && p.accessLevel === "MANAGER")).toBeTruthy()

    const patchRulesRes = await request.patch(`${apiBaseURL()}/properties/${propertyId}/rules`, {
      headers: authHeaders(manager),
      data: { minNights: 3 },
    })
    await expectStatus(patchRulesRes, 200, "properties:rules:patch")
    const patchRulesJson = await readJson<ApiResponse<{ minNights?: number }>>(patchRulesRes)
    expect(patchRulesJson.success).toBeTruthy()
    expect(Number(patchRulesJson.data.minNights)).toBe(3)

    const putRulesRes = await request.put(`${apiBaseURL()}/properties/${propertyId}/rules`, {
      headers: authHeaders(manager),
      data: {
        checkInTime: "14:00",
        checkOutTime: "10:00",
        minNights: 2,
        maxNights: 20,
        bookingLeadTimeDays: 1,
      },
    })
    await expectStatus(putRulesRes, 200, "properties:rules:put")
    const putRulesJson = await readJson<ApiResponse<{ minNights?: number; maxNights?: number }>>(putRulesRes)
    expect(putRulesJson.success).toBeTruthy()
    expect(Number(putRulesJson.data.minNights)).toBe(2)
    expect(Number(putRulesJson.data.maxNights)).toBe(20)

    const putSeasonRes = await request.put(`${apiBaseURL()}/properties/${propertyId}/rules/seasonality`, {
      headers: authHeaders(manager),
      data: [
        {
          id: null,
          startDate: "2026-06-01",
          endDate: "2026-06-10",
          priceModifier: "1.20",
          dayOfWeek: null,
          channel: null,
        },
      ],
    })
    await expectStatus(putSeasonRes, 200, "properties:seasonality:put")
    const putSeasonJson = await readJson<ApiResponse<Array<{ id: number }>>>(putSeasonRes)
    expect(putSeasonJson.success).toBeTruthy()
    expect(Array.isArray(putSeasonJson.data)).toBeTruthy()
    expect(Number(putSeasonJson.data[0]?.id)).toBeTruthy()

    const getSeasonRes = await request.get(`${apiBaseURL()}/properties/${propertyId}/rules/seasonality`, {
      headers: authHeaders(manager),
    })
    await expectStatus(getSeasonRes, 200, "properties:seasonality:get")
    const getSeasonJson = await readJson<ApiResponse<Array<{ startDate: string; endDate: string }>>>(getSeasonRes)
    expect(getSeasonJson.success).toBeTruthy()
    expect(getSeasonJson.data[0]?.startDate).toBe("2026-06-01")
    expect(getSeasonJson.data[0]?.endDate).toBe("2026-06-10")

    const expanded = await getExpanded(request, propertyId, authHeaders(manager))
    expect(expanded.id).toBe(propertyId)
    expect(Array.isArray(expanded.seasonality)).toBeTruthy()

    const badPermsRes = await request.put(`${apiBaseURL()}/properties/${propertyId}/permissions`, {
      headers: authHeaders(manager),
      data: [{ userId: manager.id, accessLevel: "MANAGER" }],
    })
    await expectStatus(badPermsRes, 400, "properties:permissions:put(missing owner)")

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(planB)")
  })

  test("OWNER: /properties/me inclui imageUrl (usado na sidebar)", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()
    const imageUrl = `https://example.com/e2e/sidebar/${suffix}.jpg`

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: { ...buildCreatePropertyPayload(suffix), imageUrl },
    })
    await expectStatus(createRes, 201, "properties:create(me imageUrl)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const meRes = await request.get(`${apiBaseURL()}/properties/me?page=0&size=50&sort=name,asc`, {
      headers: authHeaders(owner),
    })
    await expectStatus(meRes, 200, "properties:me")
    const meJson = await readJson<ApiResponse<{ content: Array<{ id: number; imageUrl?: string | null }> }>>(meRes)
    expect(meJson.success).toBeTruthy()
    const found = (meJson.data?.content || []).find((p) => Number(p.id) === propertyId)
    expect(found).toBeTruthy()
    expect(String(found?.imageUrl)).toBe(imageUrl)

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(me imageUrl)")
  })

  test("ACL: não permite remover/downgrade do último PRIMARY_OWNER", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const { session: manager } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(acl invariant)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const putPermsRes = await request.put(`${apiBaseURL()}/properties/${propertyId}/permissions`, {
      headers: authHeaders(owner),
      data: [
        { userId: owner.id, accessLevel: "PRIMARY_OWNER" },
        { userId: manager.id, accessLevel: "MANAGER" },
      ],
    })
    await expectStatus(putPermsRes, 200, "properties:permissions:put(invariant)")

    const patchOwnerRes = await request.patch(`${apiBaseURL()}/properties/${propertyId}/permissions/${owner.id}`, {
      headers: authHeaders(owner),
      data: { accessLevel: "STAFF" },
    })
    await expectStatus(patchOwnerRes, 400, "properties:permissions:patch(downgrade last owner)")

    const deleteOwnerRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}/permissions/${owner.id}`, {
      headers: authHeaders(owner),
    })
    await expectStatus(deleteOwnerRes, 400, "properties:permissions:delete(last owner)")

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(acl invariant)")
  })

  test("STAFF: pode listar permissões quando tem acesso, mas não pode gerir (403)", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()
    const staffEmail = `e2e_staff_${suffix}@nexus-estates.local`.toLowerCase()
    const staffPassword = `E2E_Str0ng_${suffix}`
    const staff = await register(request, { email: staffEmail, password: staffPassword, phone: "+351910000003", role: "STAFF" })

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(staff)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const putPermsRes = await request.put(`${apiBaseURL()}/properties/${propertyId}/permissions`, {
      headers: authHeaders(owner),
      data: [
        { userId: owner.id, accessLevel: "PRIMARY_OWNER" },
        { userId: staff.id, accessLevel: "STAFF" },
      ],
    })
    await expectStatus(putPermsRes, 200, "properties:permissions:put(add staff)")

    const staffListRes = await request.get(`${apiBaseURL()}/properties/${propertyId}/permissions`, {
      headers: authHeaders(staff),
    })
    await expectStatus(staffListRes, 200, "properties:permissions:get(staff)")
    const staffListJson = await readJson<ApiResponse<Array<{ userId: number; accessLevel: string }>>>(staffListRes)
    expect(staffListJson.success).toBeTruthy()
    expect(staffListJson.data.some((p) => p.userId === staff.id)).toBeTruthy()

    const staffPatchRulesRes = await request.patch(`${apiBaseURL()}/properties/${propertyId}/rules`, {
      headers: authHeaders(staff),
      data: { minNights: 2 },
    })
    expect(staffPatchRulesRes.status()).toBe(403)

    const staffPutSeasonRes = await request.put(`${apiBaseURL()}/properties/${propertyId}/rules/seasonality`, {
      headers: authHeaders(staff),
      data: [{ id: null, startDate: "2026-06-01", endDate: "2026-06-02", priceModifier: "1.10", dayOfWeek: null, channel: null }],
    })
    expect(staffPutSeasonRes.status()).toBe(403)

    const staffPutPermsRes = await request.put(`${apiBaseURL()}/properties/${propertyId}/permissions`, {
      headers: authHeaders(staff),
      data: [{ userId: staff.id, accessLevel: "MANAGER" }],
    })
    expect(staffPutPermsRes.status()).toBe(403)

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(staff)")
  })

  test("Seasonality: validações (endDate < startDate, priceModifier inválido) devolvem 400", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(seasonality validations)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const badRangeRes = await request.put(`${apiBaseURL()}/properties/${propertyId}/rules/seasonality`, {
      headers: authHeaders(owner),
      data: [
        { id: null, startDate: "2026-06-10", endDate: "2026-06-01", priceModifier: "1.10", dayOfWeek: null, channel: null },
      ],
    })
    await expectStatus(badRangeRes, 400, "properties:seasonality:put(bad range)")

    const badModifierRes = await request.post(`${apiBaseURL()}/properties/${propertyId}/rules/seasonality`, {
      headers: authHeaders(owner),
      data: { id: null, startDate: "2026-06-01", endDate: "2026-06-02", priceModifier: "0.00", dayOfWeek: null, channel: null },
    })
    await expectStatus(badModifierRes, 400, "properties:seasonality:post(bad modifier)")

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(seasonality validations)")
  })

  test("Rules PATCH: validações (maxNights < minNights, lead negativo) devolvem 400", async ({ request }) => {
    const { session: owner } = await registerOwner(request)
    const suffix = uniqueSuffix()

    const createRes = await request.post(`${apiBaseURL()}/properties`, {
      headers: authHeaders(owner),
      data: buildCreatePropertyPayload(suffix),
    })
    await expectStatus(createRes, 201, "properties:create(rules validations)")
    const createdJson = await readJson<ApiResponse<Property>>(createRes)
    const propertyId = createdJson.data.id

    const badRangeRes = await request.patch(`${apiBaseURL()}/properties/${propertyId}/rules`, {
      headers: authHeaders(owner),
      data: { minNights: 5, maxNights: 2 },
    })
    await expectStatus(badRangeRes, 400, "properties:rules:patch(bad min/max)")

    const badLeadRes = await request.patch(`${apiBaseURL()}/properties/${propertyId}/rules`, {
      headers: authHeaders(owner),
      data: { bookingLeadTimeDays: -1 },
    })
    await expectStatus(badLeadRes, 400, "properties:rules:patch(bad lead)")

    const deleteRes = await request.delete(`${apiBaseURL()}/properties/${propertyId}`, { headers: authHeaders(owner) })
    await expectStatus(deleteRes, 204, "properties:delete(rules validations)")
  })
})
