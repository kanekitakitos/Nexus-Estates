"use client"
import {CalendarTimeline} from "@/components/ui/calendars/calendar(x,y)";
import {BookingResponse, Page, Period, PropertyListItem, TimelineItemWithNames} from "@/types"
import {BookingService, PropertyService, UserProfile, UserService} from "@/services";
import {BookingProperty} from "@/features/bookings/components/booking-card";
import {useEffect, useMemo, useState} from "react";
import {StatCard} from "@/features/property/components/property-stats";
import {
    SquareArrowRightEnter,
    SquareArrowRightExit,
    BanknoteArrowUp,
    BanknoteX,
    ArrowLeft,
    ArrowRight
} from 'lucide-react';
import {ChartLineMultiple, LineChartData} from "@/components/ui/data-display/Charts/ChartLineMultiple";
import {ChartRadarLegend, RadarChartData} from "@/components/ui/data-display/Charts/ChartRadarLegend";
import {BarChartData, ChartBarMultiple} from "@/components/ui/data-display/Charts/ChartBarMultiple";
import {BrutalButton} from "@/components/ui/forms/button";


export function DashBoardView(){
    const [properties, setProperties] = useState<Map<number, PropertyListItem>>(new Map())
    const [bookings, setBookings] = useState<Map<number, BookingResponse[]>>(new Map())

    const [focusPropertie, setFocusPropertie] = useState<PropertyListItem | undefined>(undefined);


    const filteredProperties: PropertyListItem[] = useMemo(() => {
        return focusPropertie ? [focusPropertie] : Array.from(properties.values());
    }, [focusPropertie, properties]);


    const filteredBookings :BookingResponse[] = useMemo(() => {
        if (focusPropertie)
            return bookings.get(Number(focusPropertie.id)) ?? [];
        else
            return Array.from(bookings.values()).flat();
    }, [focusPropertie, bookings]);


    const handlePropertyClick = (item: TimelineItemWithNames) => {
        if (item.properti != undefined) {
            // Se clicar na mesma, remove o foco (toggle)
            if (focusPropertie?.id === item.properti.id) {
                setFocusPropertie(undefined);
            } else {
                setFocusPropertie(properties.get(Number(item.properti.id)));
            }
        }
    };


    const [viewDate, setViewDate] = useState<Date>(new Date())
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    useEffect(() => {
        const loadData = async () => {
            const fetchedProperties : Map<number,PropertyListItem> = new Map<number, PropertyListItem>()
            await PropertyService.listMine()
                .then((page :Page<PropertyListItem>) :PropertyListItem[] => page.content)
                .then((list:PropertyListItem[])=> {
                        for (const p of list)
                            fetchedProperties.set(p.id, p)
                })
                .catch(() => {console.error("FAIL FETCH PROPERTY")})

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


    const calendarItems = useMemo(() => {
        return createCalendarItems(filteredProperties, filteredBookings);
    }, [filteredProperties, filteredBookings]);


    const stats = useMemo(() => {
        const totals = {
            checkIn: 0,
            checkOut: 0,
            lucrado: 0,
            porLucrar: 0,
            count: filteredBookings.length,
        };

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const totalDailyPotentialRevenue = filteredProperties.reduce(
            (acc, p) => acc + p.basePrice, 0
        );

        const barMap : Map<number, BarChartData> = new Map();
        filteredProperties.forEach(p => {
            barMap.set(Number(p.id), { name: p.name, occupancy:0 ,profit: 0 } as BarChartData);
        });

        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const radarData : RadarChartData[]  = monthNames.map(
            name => ({ month:name, occupancy: 0, profit: 0 } as RadarChartData));

        const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1 , 0).getDate();
        const lineData = Array.from({ length: daysInMonth },
            (_, i) => ({
                day: i + 1,
                date: new Date(currentYear, currentMonth, i + 1),
                bookedCount: 0,
                profit: 0
        }));


        filteredBookings.forEach((b) => {
            const checkIn = new Date(b.checkInDate);
            const checkOut = new Date(b.checkOutDate);


            const isSameMonth = checkIn.getMonth() === viewDate.getMonth() &&
                checkIn.getFullYear() === viewDate.getFullYear();

            const isSameMonthOut = checkOut.getMonth() === viewDate.getMonth() &&
                checkOut.getFullYear() === viewDate.getFullYear();

            if (isSameMonth) totals.checkIn++;
            if (isSameMonthOut) totals.checkOut++;

            if (checkOut < now) totals.lucrado += b.totalPrice;
            else if (checkIn > now) totals.porLucrar += b.totalPrice;

            // A. Bar Chart: Lucro por propriedade
            const currentBar = barMap.get(Number(b.propertyId));
            if (currentBar && checkIn.getMonth() <= viewDate.getMonth() && checkOut.getMonth() >= viewDate.getMonth()
                    && checkIn.getFullYear() <= viewDate.getFullYear() && checkOut.getFullYear() >= viewDate.getFullYear()) {

                currentBar.profit += b.totalPrice;

                const daysOccupied = (checkOut.getMonth() > viewDate.getMonth()? daysInMonth : checkOut.getDate())
                    - (checkIn.getMonth() < viewDate.getMonth() ? 0 : checkIn.getDate()) + 1


                currentBar.occupancy = (currentBar.occupancy / 100 * daysInMonth + daysOccupied) / daysInMonth *100;
            }


            // B. Radar Chart: Lucro e Ocupação por mês (Ano Atual)
            if (checkIn.getFullYear() === currentYear) {
                const m = checkIn.getMonth();
                radarData[m].profit += b.totalPrice;
                // Cálculo simplificado de ocupação
                const daysOccupied :number = checkIn.getDate() + (checkOut.getMonth() > checkIn.getMonth() ? daysInMonth : checkOut.getDate())
                if (filteredProperties.length > 0)
                    radarData[m].occupancy = (radarData[m].occupancy*(daysInMonth * filteredProperties.length) + daysOccupied) / (daysInMonth * filteredProperties.length)
                else {
                    radarData[m].occupancy = 0
                    console.error("Não existe propriedades para as estatisticas")
                }
            }

            //C. Line Chart:Lucro e Ocupação total deste mês
            if (checkIn.getFullYear() == viewDate.getFullYear() && checkOut.getFullYear() == viewDate.getFullYear()
                    && checkIn.getMonth() <= viewDate.getMonth() && checkOut.getMonth() >= viewDate.getMonth()) {

                let day  = checkIn.getMonth() == viewDate.getMonth() ? checkIn.getDate() : 0
                const endDay = checkOut.getMonth() == viewDate.getMonth() ? checkOut.getDate() : daysInMonth

                for (; day < endDay; day++){
                    lineData[day].bookedCount++
                    lineData[day].profit += b.totalPrice;
                }
            }
        });

        return {
            ...totals,
            barCharData: Array.from(barMap.values()),

            radarCharData: radarData.map(m => ({
                ...m,
                // % em relação ao total de propriedades disponível no mês (ajusta o 30 se quiseres precisão por dias do mês)
                occupancy: filteredProperties.length > 0 ? (m.occupancy / (filteredProperties.length * 3)) * 100 : 0
            })) as RadarChartData[],

            lineCharData: lineData.map(d => ({
                day: `${d.day}`,
                occupancy: filteredProperties.length > 0 ? (d.bookedCount / filteredProperties.length) * 100 : 0,
                profit: totalDailyPotentialRevenue > 0 ? (d.profit / totalDailyPotentialRevenue) * 100 : 0
            })) as LineChartData[]
        };
    }, [filteredBookings, filteredProperties, viewDate]);



    return(
        <div className={"flex flex-col mx-10 my-5 gap-5"}>
            <div className={"flex justify-evenly"}>
                <StatCard
                    label={"CHECK-IN"}
                    value={stats.checkIn}
                    color={"text-emerald-500"}
                    glowColor={"bg-emerald-500"}
                    icon={SquareArrowRightEnter}
                    suffix={"Enter this month"}
                    index={0}
                    animatedCount={false}
                />
                <StatCard
                    label={"CHECK-OUT"}
                    value={stats.checkOut}
                    color={"text-rose-500"}
                    glowColor={"bg-rose-500"}
                    icon={SquareArrowRightExit}
                    suffix={"Leave this month"}
                    index={0}
                    animatedCount={false}
                />
                <StatCard
                    label={"Reservas"}
                    value={filteredBookings.length}
                    color={"text-amber-600"}
                    glowColor={"bg-amber-600"}
                    icon={SquareArrowRightExit}
                    suffix={""}
                    index={0}
                    animatedCount={false}
                />
                <StatCard
                    label={"lucro Faturado"}
                    value={stats.lucrado}
                    color={"text-lime-700"}
                    glowColor={"bg-lime-700"}
                    icon={BanknoteArrowUp}
                    suffix={"€"}
                    index={0}
                    animatedCount={false}
                />
                <StatCard
                    label={"lucro por faturar"}
                    value={stats.porLucrar}
                    color={"text-sky-300"}
                    glowColor={"bg-sky-300"}
                    icon={BanknoteX}
                    suffix={"€"}
                    index={0}
                    animatedCount={false}
                />
            </div>

            {/* Título e Data */}
            <div className=" flex flex-row items-center mb-4 gap-5">
                <BrutalButton onClick={() => {
                    setViewDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1));
                }}>
                    <ArrowLeft size={14}/>
                </BrutalButton>

                <div
                    className="text-xl rounded-2xl font-black uppercase tracking-wider bg-black text-white px-4 py-3 inline-block"
                    onClick={()=>{setViewDate(new Date())}}
                >
                    {new Date().getFullYear() == viewDate.getFullYear() && new Date().getMonth() == viewDate.getMonth()
                        ?<>
                            <h1>TODAY is</h1>
                            <span>{new Date().getDate()}</span>
                        </>
                        : <></>
                    }
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </div>



                <BrutalButton onClick={() => {
                    setViewDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1));
                }}>
                    <ArrowRight size={14}/>
                </BrutalButton>
            </div>

            <CalendarTimeline
                items={calendarItems}
                year={viewDate.getFullYear()}
                month={viewDate.getMonth()}
                onClickData={handlePropertyClick}
            />

            <div className="grid grid-cols-3 gap-5">
                <div className="flex flex-col gap-5">
                    <ChartBarMultiple chartData={stats.barCharData}/>
                    <ChartRadarLegend chartData={stats.radarCharData} />
                </div>
                <ChartLineMultiple
                    className="col-span-2"
                    chartData={stats.lineCharData}
                />
            </div>
        </div>
    )
}

export default DashBoardView

//--------------------------------------------------
//              FUNÇÕES AUXILIARES


function createCalendarItems(properties : PropertyListItem[], bookings : BookingResponse[]) :TimelineItemWithNames[]{
    const calendarItems :TimelineItemWithNames[] = []
    const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-purple-500"]
    let i = 0


    properties.forEach((p)=>{
        const id :number = Number(p.id)
        if (!isNaN(id)) {
            const bs_of_p :BookingResponse[] = bookings.filter((b) => id == b.propertyId)

            const periods : Period[] = []

            bs_of_p.forEach(async (b:BookingResponse)=> {
                let name : string
                try {
                    if (typeof b.userId != "number")
                        name = "Unknown User"
                    else {
                        const resp: UserProfile = await UserService.getUserId(b.userId);
                        name = resp.email
                    }
                }catch (e){
                    name = "Unknown User"
                }

                periods.push(
                    {
                        startDay: new Date(b.checkInDate),// "valor recebido: \"2026-02-15\""
                        endDay: new Date(b.checkOutDate),
                        name:  name,
                        color: colors[i]
                    } as Period
                )
                i = (i + 1) % colors.length
            })

            calendarItems.push(
                {
                    properti: p,
                    id: id,
                    label: p.name,
                    periods: periods,
                }as TimelineItemWithNames)
        }
    })

    return calendarItems
}
