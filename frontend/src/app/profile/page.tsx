import { ProfileView } from "@/features/profile/profile-view"

/**
 * @page ProfilePage
 * @description Ponto de entrada (Server/Client Component) para a rota `/profile`.
 * Apenas inicializa e invoca o contentor do perfil de forma modular e encapsulada.
 */
export default function ProfilePage() {
  return <ProfileView />
}
