import { defineConfig } from "@playwright/test"

const apiBaseURL = process.env.E2E_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: apiBaseURL,
  },
})

