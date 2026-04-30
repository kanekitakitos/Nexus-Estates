"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

export type PropertyImageProps = {
  src?: string | null
  alt: string
  width: number
  height: number
  sizes?: string
  className?: string
  priority?: boolean
  fallbackSrc?: string
}

function rewriteCloudinaryFetchUrl(url: URL, width: number, height: number) {
  const marker = "/image/fetch/"
  const markerIndex = url.pathname.indexOf(marker)
  if (markerIndex < 0) return url

  const afterMarker = url.pathname.slice(markerIndex + marker.length)
  const firstSlash = afterMarker.indexOf("/")
  if (firstSlash < 0) return url

  const encodedRemoteUrl = afterMarker.slice(firstSlash + 1)
  const transform = `f_auto,q_auto,c_fill,g_auto,w_${width},h_${height}`
  const newPath =
    url.pathname.slice(0, markerIndex + marker.length) +
    transform +
    "/" +
    encodedRemoteUrl

  return new URL(url.origin + newPath)
}

function rewriteUnsplashUrl(url: URL, width: number, height: number) {
  url.searchParams.set("w", String(width))
  url.searchParams.set("h", String(height))
  url.searchParams.set("fit", "crop")
  url.searchParams.set("auto", "format")
  if (!url.searchParams.has("q")) url.searchParams.set("q", "80")
  return url
}

function resolveOptimizedSrc(src: string, width: number, height: number) {
  try {
    const url = new URL(src)

    if (url.hostname === "images.unsplash.com") {
      return rewriteUnsplashUrl(url, width, height).toString()
    }

    if (url.hostname === "res.cloudinary.com") {
      return rewriteCloudinaryFetchUrl(url, width, height).toString()
    }

    return src
  } catch {
    return src
  }
}

export function PropertyImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  priority,
  fallbackSrc = "/ico/icoC.png",
}: PropertyImageProps) {
  const [hasError, setHasError] = useState(false)

  const resolvedSrc = useMemo(() => {
    const base = src?.trim()
    if (!base) return fallbackSrc
    if (hasError) return fallbackSrc
    return resolveOptimizedSrc(base, width, height)
  }, [fallbackSrc, hasError, height, src, width])

  const isRemote = resolvedSrc.startsWith("http://") || resolvedSrc.startsWith("https://")

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={isRemote}
      onError={() => setHasError(true)}
    />
  )
}
