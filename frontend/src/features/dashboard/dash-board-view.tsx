"use client"
import type { BookingResponse, Page, PropertyListItem, SeasonalityRuleDTO, TimelineItemWithNames } from "@/types"
import {BookingService, PropertyService} from "@/services";
import {BookingProperty} from "@/features/bookings/components/booking-card";
import {useEffect, useMemo, useState} from "react";
import { DashboardStatsRow } from "@/features/dashboard/components/DashboardStatsRow"
import { DashboardMonthHeader } from "@/features/dashboard/components/DashboardMonthHeader"
import { DashboardTimeline } from "@/features/dashboard/components/DashboardTimeline"
import { DashboardCharts } from "@/features/dashboard/components/DashboardCharts"
import { createCalendarItems } from "@/features/dashboard/lib/create-calendar-items"
import { useDashboardStats } from "@/features/dashboard/model/use-dashboard-stats"


export function DashBoardView(){
    // ─────────────────────────────────────────────
    // ESTADO E DATA-HOLDING
    // ─────────────────────────────────────────────
    const [properties, setProperties] = useState<Map<number, PropertyListItem>>(new Map())
    const [bookings, setBookings] = useState<Map<number, BookingResponse[]>>(new Map())

    // Quando defenenido, a dasboard só mostra dados desta propriedade
    const [focusPropertie, setFocusPropertie] = useState<PropertyListItem | undefined>(undefined);
    const [seasonalityRules, setSeasonalityRules] = useState<SeasonalityRuleDTO[]>([])
    const [isLoadingSeasonality, setIsLoadingSeasonality] = useState(false)
    const [filterActiveOnly, setFilterActiveOnly] = useState(false)
    const [filterWithBookingsOnly, setFilterWithBookingsOnly] = useState(false)

    // Data (ano e mês) que a dashboard está a analizar
    const [viewDate, setViewDate] = useState<Date>(new Date())
    const [today, setToday] = useState<Date | null>(null)
    const [isClient, setIsClient] = useState(false)
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // ─────────────────────────────────────────────
    // LÓGICA DE FILTRAGEM
    // ─────────────────────────────────────────────

    const propertiesArray = useMemo(() => Array.from(properties.values()), [properties])

    const propertyHasBookingsInViewMonth = useMemo(() => {
        const map = new Map<number, boolean>()
        for (const p of propertiesArray) {
            const list = bookings.get(Number(p.id)) ?? []
            map.set(Number(p.id), hasBookingInMonth(list, viewDate.getFullYear(), viewDate.getMonth()))
        }
        return map
    }, [propertiesArray, bookings, viewDate])

    // propriedades a serem mostradas/analizadas (filtros + ordenação)
    const filteredProperties: PropertyListItem[] = useMemo(() => {
        if (focusPropertie) return [focusPropertie]

        const base = propertiesArray
            .filter((p) => (filterActiveOnly ? p.isActive : true))
            .filter((p) => (filterWithBookingsOnly ? (propertyHasBookingsInViewMonth.get(Number(p.id)) ?? false) : true))

        return base.sort((a, b) => {
            const aHas = propertyHasBookingsInViewMonth.get(Number(a.id)) ? 1 : 0
            const bHas = propertyHasBookingsInViewMonth.get(Number(b.id)) ? 1 : 0
            if (aHas !== bHas) return bHas - aHas
            return a.name.localeCompare(b.name, "pt-PT")
        })
    }, [focusPropertie, propertiesArray, filterActiveOnly, filterWithBookingsOnly, propertyHasBookingsInViewMonth]);

    // bookings a serem mostrados/analizados
    const filteredBookings :BookingResponse[] = useMemo(() => {
        if (focusPropertie)
            return bookings.get(Number(focusPropertie.id)) ?? [];
        return filteredProperties.flatMap((p) => bookings.get(Number(p.id)) ?? [])
    }, [focusPropertie, bookings, filteredProperties]);

    /**
     * Altera o foco para a propriedade indicada na timelineItem
     */
    const handlePropertyClick = (timelineItem: TimelineItemWithNames) => {
        if (timelineItem.properti != undefined) {
            // Se clicar na mesma, remove o foco (toggle)
            if (focusPropertie?.id === timelineItem.properti.id) {
                setFocusPropertie(undefined);
            } else {
                setFocusPropertie(properties.get(Number(timelineItem.properti.id)));
            }
        }
    };

    // inicia os dados da dashboard
    useEffect(() => {
        setIsClient(true)
        setToday(new Date())

        const loadData = async () => {
            const fetchedProperties : Map<number,PropertyListItem> = new Map<number, PropertyListItem>()

            // guarda as propriedades
            await PropertyService.listMine()
                .then((page :Page<PropertyListItem>) :PropertyListItem[] => page.content)
                .then((list:PropertyListItem[])=> {
                        for (const p of list)
                            fetchedProperties.set(p.id, p)
                })
                .catch(() => {console.error("FAIL FETCH PROPERTY")})

            // guarda as reservas
            const fetchedBookings :Map<number, BookingResponse[]> = new Map<number, BookingResponse[]>()
            for (const p of fetchedProperties.values()) {
                const books :BookingResponse[] = await BookingService.getBookingsByProperty(p.id).then((br :BookingResponse[])=>br)
                fetchedBookings.set(p.id, books)
            }

            setProperties(fetchedProperties);
            setBookings(fetchedBookings);
        };

        loadData();
    }, []);

    useEffect(() => {
        const propertyId = focusPropertie?.id
        if (!propertyId) {
            setSeasonalityRules([])
            return
        }

        let cancelled = false
        setIsLoadingSeasonality(true)
        PropertyService.getSeasonalityRules(propertyId)
            .then((rules) => {
                if (cancelled) return
                setSeasonalityRules(rules)
            })
            .finally(() => {
                if (cancelled) return
                setIsLoadingSeasonality(false)
            })

        return () => {
            cancelled = true
        }
    }, [focusPropertie?.id])

    const seasonalityMultipliers = useMemo(() => {
        if (!focusPropertie) return null
        return computeSeasonalityMultipliers(seasonalityRules, viewDate.getFullYear(), viewDate.getMonth())
    }, [focusPropertie, seasonalityRules, viewDate])


    const calendarItems = useMemo(() => {
        return createCalendarItems(filteredProperties, filteredBookings);
    }, [filteredProperties, filteredBookings]);


    // ─────────────────────────────────────────────
    // PROCESSAMENTO DE ESTATÍSTICAS (BI)
    // ─────────────────────────────────────────────

    /** Transforma as reservas filtradas em dados para Gráficos e StatCards.
     *  Esta função percorre as reservas uma única vez para popular múltiplos datasets.
     */
    const stats = useDashboardStats({ filteredBookings, filteredProperties, viewDate })



    return(
        <div className={"flex flex-col mx-10 my-5 gap-5"}>
            <DashboardStatsRow
                checkIn={stats.checkIn}
                checkOut={stats.checkOut}
                bookingCount={filteredBookings.length}
                lucrado={stats.lucrado}
                porLucrar={stats.porLucrar}
            />

            {/* Título e Data */}
            <DashboardMonthHeader
                viewDate={viewDate}
                monthNames={monthNames}
                today={today}
                focusedPropertyLabel={focusPropertie?.name}
                onClearFocus={() => setFocusPropertie(undefined)}
                filterActiveOnly={filterActiveOnly}
                onFilterActiveOnlyChange={setFilterActiveOnly}
                filterWithBookingsOnly={filterWithBookingsOnly}
                onFilterWithBookingsOnlyChange={setFilterWithBookingsOnly}
                onPrev={() => setViewDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1))}
                onNext={() => setViewDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1))}
                onResetToday={() => setViewDate(new Date())}
            />

            <DashboardTimeline
                calendarItems={calendarItems}
                viewDate={viewDate}
                onClickData={handlePropertyClick}
                seasonality={
                    focusPropertie && seasonalityMultipliers && !isLoadingSeasonality
                        ? { multipliers: seasonalityMultipliers }
                        : undefined
                }
            />


            <DashboardCharts
                isClient={isClient}
                barCharData={stats.barCharData}
                radarCharData={stats.radarCharData}
                lineCharData={stats.lineCharData}
                bookingStatusPie={stats.bookingStatusPie}
                bookingsByProperty={stats.bookingsByProperty}
            />
        </div>
    )
}

export default DashBoardView

/**
 * Parse seguro de "YYYY-MM-DD" para uma Date em tempo local (00:00).
 */
function parseISODateLocal(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map((part) => Number(part))
    return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
    const x = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    const a = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const b = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
    return x >= a && x <= b
}

/**
 * Gera um multiplicador por dia do mês (default 1.0). Se existirem overlaps, aplica o maior multiplicador.
 */
function computeSeasonalityMultipliers(
    rules: SeasonalityRuleDTO[],
    year: number,
    month: number
): number[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const multipliers = Array.from({ length: daysInMonth }, () => 1)

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day)
        let best = 1
        for (const rule of rules) {
            const start = parseISODateLocal(rule.startDate)
            const end = parseISODateLocal(rule.endDate)
            if (!isDateInRange(date, start, end)) continue
            const modifier = typeof rule.priceModifier === "number" ? rule.priceModifier : 1
            if (modifier > best) best = modifier
        }
        multipliers[day - 1] = best
    }

    return multipliers
}

function hasBookingInMonth(bookings: BookingResponse[], year: number, month: number): boolean {
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    return bookings.some((b) => {
        const checkIn = new Date(b.checkInDate)
        const checkOut = new Date(b.checkOutDate)
        return checkIn <= monthEnd && checkOut >= monthStart
    })
}
