"use client"

import { useMemo, useState, useEffect } from "react"
import { BookingList } from "./booking-list"
import { BookingProperty } from "./booking-card"
import { BookingSearchBar } from "./booking-search-bar"
import { BookingDetails } from "./booking-details"
import { cn } from "@/lib/utils"

// Mock Data
const MOCK_PROPERTIES: BookingProperty[] = [
    {
        id: "1",
        title: "Modern Loft in Downtown",
        description: "Experience city living at its finest in this spacious loft with floor-to-ceiling windows and modern amenities.",
        location: "New York, NY",
        price: 250,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.8,
        featured: true,
        tags: ["City View", "Loft", "High Floor", "Workspace"]
    },
    {
        id: "2",
        title: "Cozy Mountain Cabin",
        description: "Escape to the mountains in this rustic yet luxurious cabin. Perfect for winter getaways and summer hikes.",
        location: "Aspen, CO",
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop",
        status: "BOOKED", // Should be filtered out
        rating: 4.9,
        featured: true,
        tags: ["Fireplace", "Snow Nearby", "Hot Tub"]
    },
    {
        id: "3",
        title: "Seaside Villa with Pool",
        description: "Relax by the ocean in this stunning villa featuring a private infinity pool and direct beach access.",
        location: "Malibu, CA",
        price: 1200,
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 5.0,
        tags: ["Oceanfront", "Infinity Pool", "Private Beach", "Luxury"]
    },
    {
        id: "4",
        title: "Urban Studio Apartment",
        description: "Compact and efficient studio in the heart of the business district. Ideal for business travelers.",
        location: "Chicago, IL",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.5,
        tags: ["Business District", "Compact", "Fast Wi-Fi"]
    },
    {
        id: "5",
        title: "Historic Townhouse",
        description: "Step back in time in this beautifully restored townhouse with original architectural details.",
        location: "Boston, MA",
        price: 350,
        imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop",
        status: "MAINTENANCE", // Should be filtered out
        rating: 4.7,
        tags: ["Historic Center", "Original Details"]
    },
    {
        id: "6",
        title: "Lakefront Cottage",
        description: "Peaceful cottage right on the water's edge. Enjoy fishing, kayaking, or just watching the sunset.",
        location: "Lake Tahoe, NV",
        price: 280,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.6,
        tags: ["Lakefront", "Sunset View", "Kayak Included"]
    },
    {
        id: "7",
        title: "Modern Loft in Downtown",
        description: "Experience city living at its finest in this spacious loft with floor-to-ceiling windows and modern amenities.",
        location: "New York, NY",
        price: 250,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.8,
        featured: true,
        tags: ["City View", "Loft", "High Floor", "Workspace"]
    },
    {
        id: "8",
        title: "Cozy Mountain Cabin",
        description: "Escape to the mountains in this rustic yet luxurious cabin. Perfect for winter getaways and summer hikes.",
        location: "Aspen, CO",
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop",
        status: "BOOKED", // Should be filtered out
        rating: 4.9,
        featured: true,
        tags: ["Fireplace", "Snow Nearby", "Hot Tub"]
    },
    {
        id: "9",
        title: "Seaside Villa with Pool",
        description: "Relax by the ocean in this stunning villa featuring a private infinity pool and direct beach access.",
        location: "Malibu, CA",
        price: 1200,
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 5.0,
        tags: ["Oceanfront", "Infinity Pool", "Private Beach", "Luxury"]
    },
    {
        id: "10",
        title: "Urban Studio Apartment",
        description: "Compact and efficient studio in the heart of the business district. Ideal for business travelers.",
        location: "Chicago, IL",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.5,
        tags: ["Business District", "Compact", "Fast Wi-Fi"]
    },
    {
        id: "11",
        title: "Historic Townhouse",
        description: "Step back in time in this beautifully restored townhouse with original architectural details.",
        location: "Boston, MA",
        price: 350,
        imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop",
        status: "MAINTENANCE", // Should be filtered out
        rating: 4.7,
        tags: ["Historic Center", "Original Details"]
    },
    {
        id: "12",
        title: "Lakefront Cottage",
        description: "Peaceful cottage right on the water's edge. Enjoy fishing, kayaking, or just watching the sunset.",
        location: "Lake Tahoe, NV",
        price: 280,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.6,
        tags: ["Lakefront", "Sunset View", "Kayak Included"]
    },
    {
        id: "13",
        title: "Modern Loft in Downtown",
        description: "Experience city living at its finest in this spacious loft with floor-to-ceiling windows and modern amenities.",
        location: "New York, NY",
        price: 250,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.8,
        featured: true,
        tags: ["City View", "Loft", "High Floor", "Workspace"]
    },
    {
        id: "14",
        title: "Cozy Mountain Cabin",
        description: "Escape to the mountains in this rustic yet luxurious cabin. Perfect for winter getaways and summer hikes.",
        location: "Aspen, CO",
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop",
        status: "BOOKED", // Should be filtered out
        rating: 4.9,
        featured: true,
        tags: ["Fireplace", "Snow Nearby", "Hot Tub"]
    },
    {
        id: "15",
        title: "Seaside Villa with Pool",
        description: "Relax by the ocean in this stunning villa featuring a private infinity pool and direct beach access.",
        location: "Malibu, CA",
        price: 1200,
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 5.0,
        tags: ["Oceanfront", "Infinity Pool", "Private Beach", "Luxury"]
    },
    {
        id: "16",
        title: "Urban Studio Apartment",
        description: "Compact and efficient studio in the heart of the business district. Ideal for business travelers.",
        location: "Chicago, IL",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.5,
        tags: ["Business District", "Compact", "Fast Wi-Fi"]
    },
    {
        id: "17",
        title: "Historic Townhouse",
        description: "Step back in time in this beautifully restored townhouse with original architectural details.",
        location: "Boston, MA",
        price: 350,
        imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop",
        status: "MAINTENANCE", // Should be filtered out
        rating: 4.7,
        tags: ["Historic Center", "Original Details"]
    },
    {
        id: "18",
        title: "Lakefront Cottage",
        description: "Peaceful cottage right on the water's edge. Enjoy fishing, kayaking, or just watching the sunset.",
        location: "Lake Tahoe, NV",
        price: 280,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.6,
        tags: ["Lakefront", "Sunset View", "Kayak Included"]
    }
]

export function BookingView() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProperty, setSelectedProperty] = useState<BookingProperty | null>(null)
    const [lastViewedPropertyId, setLastViewedPropertyId] = useState<string | null>(null)
    const [isLeaving, setIsLeaving] = useState(false)
    const [isReturning, setIsReturning] = useState(false)
    
    // Filters state
    const [adults, setAdults] = useState(1)
    const [children, setChildren] = useState(0)
    const [maxPrice, setMaxPrice] = useState<number | "">("")

    const filteredProperties = useMemo(() => 
        {
        let filtered = MOCK_PROPERTIES.filter(p => p.status === "AVAILABLE")

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(term) || 
                p.location.toLowerCase().includes(term)
            )
        }

        if (maxPrice !== "") {
            filtered = filtered.filter(p => p.price <= Number(maxPrice))
        }

        return filtered
    }, [searchTerm, adults, children, maxPrice])

    const handleBook = (id: string) => {
        const property = MOCK_PROPERTIES.find(p => p.id === id)
        if (property) {
            setLastViewedPropertyId(id) // Save as last viewed
            setIsLeaving(true)
            setTimeout(() => {
                setSelectedProperty(property)
                setIsLeaving(false)
                setIsReturning(false)
                window.scrollTo(0, 0)
            }, 800) // Match animation duration
        }
    }

    // Gesture navigation for "Forward" (Re-open last viewed)
    useEffect(() => {
        // Only active when NOT viewing a property
        if (selectedProperty) return

        let touchStartX = 0
        let touchStartY = 0

        const handleWheel = (e: WheelEvent) => {
            // Check if horizontal scroll is dominant
            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
            
            // Only trigger if we have a last viewed property AND we are not currently animating
            if (isHorizontal && lastViewedPropertyId && !isLeaving && !isReturning) {
                // Swipe Left-to-Right (deltaX > 20) -> Go FORWARD to last property
                // This corresponds to pushing content to the left (moving forward in history)
                if (e.deltaX > 20) {
                     // Need to call handleBook, but it's inside component scope.
                     // We can't access it easily if it depends on state that might change?
                     // Actually handleBook is stable enough or we include it in deps.
                     
                     // Find the property again to be safe
                     const property = MOCK_PROPERTIES.find(p => p.id === lastViewedPropertyId)
                     if (property) {
                        setIsLeaving(true)
                        setTimeout(() => {
                            setSelectedProperty(property)
                            setIsLeaving(false)
                            setIsReturning(false)
                            window.scrollTo(0, 0)
                        }, 800)
                     }
                }
            }
        }

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX
            touchStartY = e.touches[0].clientY
        }

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX
            const touchEndY = e.changedTouches[0].clientY
            
            const deltaX = touchEndX - touchStartX
            const deltaY = touchEndY - touchStartY

            // Swipe Left (deltaX < -50) -> Go FORWARD (content moves left)
            if (deltaX < -50 && Math.abs(deltaX) > Math.abs(deltaY) && lastViewedPropertyId && !isLeaving && !isReturning) {
                handleBook(lastViewedPropertyId)
            }
        }

        window.addEventListener("wheel", handleWheel)
        window.addEventListener("touchstart", handleTouchStart)
        window.addEventListener("touchend", handleTouchEnd)
        
        return () => {
            window.removeEventListener("wheel", handleWheel)
            window.removeEventListener("touchstart", handleTouchStart)
            window.removeEventListener("touchend", handleTouchEnd)
        }
    }, [selectedProperty, lastViewedPropertyId, isLeaving, isReturning])

    const handleBack = () => {
        setIsReturning(true)
        // Scroll to top immediately to ensure smooth entry animation
        window.scrollTo({ top: 0, behavior: 'instant' })
        
        setTimeout(() => {
            setSelectedProperty(null)
            // Animation class will be applied by isReturning state in the render
            // Reset isReturning after animation completes
            setTimeout(() => {
                setIsReturning(false)
            }, 1000)
        }, 800)
    }

    // Check for returning state on mount
    useEffect(() => {
        if (isReturning) {
            // Force re-flow or ensure classes are applied
            window.scrollTo({ top: 0, behavior: 'instant' })
        }
    }, [isReturning])

    if (selectedProperty) {
        // Pass isReturning to BookingDetails to trigger exit animation
        return <BookingDetails property={selectedProperty} onBack={handleBack} isExiting={isReturning} />
    }

    return (
        <div className="relative flex flex-col space-y-6 p-6 px-[150px] min-h-screen overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-[-1] bg-[size:40px_40px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]" />
            
            <div className={cn(
                "flex flex-col space-y-2 mb-8 transition-all duration-500",
                isLeaving && "animate-fly-out-chaos-1",
                isReturning && "animate-fly-in-chaos-1"
            )}>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-2">
                    <span className="bg-primary text-primary-foreground px-2 inline-block -rotate-1 mr-2 shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)]">Find</span>
                    <span className="inline-block rotate-1">Your</span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 underline decoration-4 decoration-primary underline-offset-4">Next Stay</span>
                </h1>
                <p className="text-xl text-muted-foreground font-mono max-w-2xl border-l-4 border-primary pl-4">
                    Explore our curated selection of premium properties available for your dates.
                </p>
            </div>
            
            <div className={cn(
                isLeaving && "animate-fly-out-chaos-2 delay-100",
                isReturning && "animate-fly-in-chaos-2 delay-100"
            )}>
                <BookingSearchBar 
                    destination={searchTerm}
                    adults={adults}
                    childrenCount={children}
                    onDestinationChange={setSearchTerm}
                    onAdultsChange={setAdults}
                    onChildrenChange={setChildren}
                />
            </div>

            <div className={cn(
                "relative",
                // Removed animation classes from here to apply them to individual items in BookingList
            )}>
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-foreground/10" />
                <BookingList 
                    properties={filteredProperties} 
                    onBook={handleBook} 
                    isLeaving={isLeaving}
                    isReturning={isReturning}
                />
            </div>
        </div>
    )
}
