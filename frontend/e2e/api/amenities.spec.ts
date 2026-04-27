import { expect, test } from "@playwright/test"
import { apiBaseURL, authHeaders, expectStatus, readJson, registerOwner, uniqueSuffix } from "./helpers"

type Amenity = { id: number; name: Record<string, string>; category: string; icon?: string }

test.describe.serial("API • Amenities (CRUD)", () => {
  test("criar → obter → atualizar → remover", async ({ request }) => {
    const { session } = await registerOwner(request)

    const createRes = await request.post(`${apiBaseURL()}/amenities`, {
      headers: authHeaders(session),
      data: { name: { pt: `E2E Amenity ${uniqueSuffix()}` }, category: "COMFORT" },
    })
    await expectStatus(createRes, 201, "amenities:create")
    const created = await readJson<Amenity>(createRes)
    expect(created.id).toBeTruthy()

    const getRes = await request.get(`${apiBaseURL()}/amenities/${created.id}`, { headers: authHeaders(session) })
    await expectStatus(getRes, 200, "amenities:get")
    const fetched = await readJson<Amenity>(getRes)
    expect(fetched.id).toBe(created.id)

    const updateRes = await request.put(`${apiBaseURL()}/amenities/${created.id}`, {
      headers: authHeaders(session),
      data: { name: { pt: `E2E Amenity Updated ${uniqueSuffix()}` }, category: "COMFORT", icon: "fa-wifi" },
    })
    await expectStatus(updateRes, 200, "amenities:update")
    const updated = await readJson<Amenity>(updateRes)
    expect(updated.name?.pt).toContain("Updated")

    const listRes = await request.get(`${apiBaseURL()}/amenities`, { headers: authHeaders(session) })
    await expectStatus(listRes, 200, "amenities:list")
    const list = await readJson<Amenity[]>(listRes)
    expect(Array.isArray(list)).toBeTruthy()
    expect(list.some((a) => a.id === created.id)).toBeTruthy()

    const deleteRes = await request.delete(`${apiBaseURL()}/amenities/${created.id}`, { headers: authHeaders(session) })
    await expectStatus(deleteRes, 204, "amenities:delete")

    const afterDeleteRes = await request.get(`${apiBaseURL()}/amenities/${created.id}`, { headers: authHeaders(session) })
    expect(afterDeleteRes.status()).not.toBe(200)
  })
})
