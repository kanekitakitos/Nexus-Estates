/**
 * @file index.ts
 * @author Nexus Estates team
 * @description Ponto de entrada (barrel file) do módulo de reservas (bookings).
 *              Exporta a vista principal, a barra lateral e os tokens do módulo.
 */

export { BookingView } from "./views/BookingView"
export { BookingCompactSidebar } from "./components/booking-compact-sidebar"
export { bookingsTokens } from "./tokens"
