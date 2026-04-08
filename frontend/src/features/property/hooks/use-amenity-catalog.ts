import { useState, useEffect } from "react"
import { AmenityService, Amenity } from "@/services/amenity.service"

export function useAmenityCatalog() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    AmenityService.listAll()
      .then((data) => {
        if (isMounted) {
          setAmenities(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError("Failed to load amenities catalog")
          console.error(err)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { amenities, isLoading, error }
}
