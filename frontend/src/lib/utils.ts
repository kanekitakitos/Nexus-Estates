import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Une múltiplas classes de CSS, resolvendo conflitos de Tailwind automaticamente.
 * @param inputs - Lista de strings, objetos ou arrays de classes (ex: { 'bg-red-500': true })
 * @returns Uma string limpa com as classes finais processadas.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
