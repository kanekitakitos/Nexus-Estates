"use client"

import { useMemo, useState } from "react"
import { BookingList } from "./booking-list"
import { BookingProperty } from "./booking-card"
import { Button } from "@/components/ui/forms/button"
import { Input } from "@/components/ui/forms/input"
import { Label } from "@/components/ui/forms/label"
import { Search, SlidersHorizontal, Filter, X } from "lucide-react"
import { Separator } from "@/components/ui/layout/separator"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/overlay/sheet"

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
    
    // Filters state
    const [adults, setAdults] = useState(1)
    const [children, setChildren] = useState(0)
    const [maxPrice, setMaxPrice] = useState<number | "">("")

    const filteredProperties = useMemo(() => {
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

        // Logic for adults/children would typically check capacity, 
        // but for now we'll just simulate it or keep it prepared for when backend has capacity data.
        // For this mock, we assume all properties fit at least 1 person.
        
        return filtered
    }, [searchTerm, adults, children, maxPrice])

    const handleBook = (id: string) => {
        console.log(`Booking requested for property ${id}`)
        // Implement booking logic here
    }

    const clearFilters = () => {
        setAdults(1)
        setChildren(0)
        setMaxPrice("")
        setSearchTerm("")
    }

    const activeFiltersCount = (maxPrice !== "" ? 1 : 0) + (adults > 1 ? 1 : 0) + (children > 0 ? 1 : 0)

    return (
        <div className="relative flex flex-col space-y-6 p-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Find Your Next Stay</h1>
                <p className="text-muted-foreground">
                    Explore our curated selection of premium properties available for your dates.
                </p>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-md flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search locations..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>
                                    Refine your search results.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-6 py-6">
                                <div className="space-y-2">
                                    <Label>Price Range (Max Nightly)</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">$0</span>
                                        <Input 
                                            type="number" 
                                            placeholder="Any" 
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                                            min={0}
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Guests</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Adults</Label>
                                            <Input 
                                                type="number" 
                                                min={1} 
                                                value={adults}
                                                onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground">Children</Label>
                                            <Input 
                                                type="number" 
                                                min={0} 
                                                value={children}
                                                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <SheetFooter className="flex-col gap-2 sm:flex-col">
                                <SheetClose asChild>
                                    <Button type="submit">Show {filteredProperties.length} properties</Button>
                                </SheetClose>
                                <Button variant="ghost" onClick={clearFilters} className="w-full">
                                    Clear all filters
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Active filters display (optional, simplified for now) */}
            {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-3 w-3" />
                    <span>Active filters:</span>
                    {maxPrice !== "" && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Max ${maxPrice}</span>}
                    {adults > 1 && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{adults} Adults</span>}
                    {children > 0 && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{children} Children</span>}
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={clearFilters}>
                        <X className="h-3 w-3" />
                        <span className="sr-only">Clear filters</span>
                    </Button>
                </div>
            )}

            <div className="my-4 h-[1px] w-full bg-border" />

            <BookingList properties={filteredProperties} onBook={handleBook} />
        </div>
    )
}
