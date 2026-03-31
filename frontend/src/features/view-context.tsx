"use client"
import { createContext, useContext, useState, ReactNode } from "react"
import {BookingProperty} from "@/features/bookings/components/booking-card";

type PossibleViews = "booking" | "properties"

interface ViewContextType {
    view: PossibleViews
    setView: (view: PossibleViews) => void

    selectedPropertyId: string | null
    // funcao para ir para a propertie
    selectPropertyId: (id: string | null) => void
}

const ViewContext = createContext<ViewContextType | undefined>(undefined)

export function ViewProvider({ children }: { children: ReactNode }) {
    const [view, setView] = useState<PossibleViews>("booking")
    const [selectedPropertyId, setPropertyId] = useState<string | null>(null)

    const selectPropertyId = (id: string | null) => {
        setView("properties");
        setPropertyId(id);
    };

    return (
        <ViewContext.Provider value={{
            view,
            setView,
            selectedPropertyId,
            selectPropertyId
        }}>
            {children}
        </ViewContext.Provider>
    )
}

export const useView = () => {
    const context = useContext(ViewContext)
    if (!context) throw new Error("useView deve ser usado dentro de um ViewProvider")
    return context
}