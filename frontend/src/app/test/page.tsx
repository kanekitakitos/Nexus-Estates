"use client"
import {ImageInput} from "@/components/ui/file-handler/imageInput"
import {BrutalButton} from "@/components/ui/forms/button";
import {propertiesAxios} from "@/lib/axiosAPI"
import {CalendarTimeline} from "@/components/ui/calendars/calendar(x,y)"
import {useState} from "react";
import {BookingProperty, BookingResponse, Period, TimelineItemWithNames} from "@/types";
import {MOCK_BOOKINGS, MOCK_PROPERTIES, MOCK_USER} from "@/features/dashboard/MOCK_DATA";
import {UserProfile} from "@/types/user";

const cYear = new Date().getFullYear()
const cMonth = 1//new Date().getMonth(); // Abril (0-based)


function date(day: number): Date{
    return new Date(cYear, cMonth, day)
}



export default function test(){


    // Exemplo 1: Reservas de Quartos de Hotel
    const propertyBookings : TimelineItemWithNames[] = [
        {
            id: 1,
            label: 'Apartamento Centro',
            periods: [
                { startDay: new Date(cYear, cMonth-1, 28), endDay: date(2), name: 'C Kovecic', color: 'bg-blue-400' },
                { startDay: date(4), endDay: date(4), name: 'Marton Kovecic', color: 'bg-blue-400' },
                { startDay: date( 5), endDay:date(6), name: 'Marton Kovecic', color: 'bg-red-400' },
                { startDay: date( 8), endDay: date(10), name: 'Erica Haland', color: 'bg-red-300' },
                { startDay: date( 13), endDay: date(18), name: 'Wayne Rooney', color: 'bg-pink-300' },
                { startDay: date( 21), endDay: date(24), name: 'Paul Schole 2sadass', color: 'bg-orange-300' },
                 { startDay: new Date( "2026-01-16"), endDay: new Date("2026-01-20"), name: 'Não aparece', color: 'bg-orange-300' },
            ],
        },
        {
            id: 2,
            label: 'Casa Praia',
            periods: [
                { startDay:  new Date(cYear, cMonth-1, 28), endDay:  new Date(cYear, cMonth+1, 2), name: 'João Silva', color: 'bg-green-300' },
            ],
        },
        {
            id: 3,
            label: 'Loft Industrial',
            periods: [
                { startDay: date( 1), endDay: date(2), name: 'Ana Costa', color: 'bg-yellow-200' },
                { startDay: date( 5), endDay: date(9), name: 'Diego Maradona', color: 'bg-red-300' },
                { startDay: date( 12), endDay: date(14), name: 'Zineide Z.', color: 'bg-teal-200' },
                { startDay: date( 27), endDay: date(30), name: 'Sara L.', color: 'bg-pink-300' },
            ],
        },
        {
            id: 4,
            label: 'Studio Moderno',
            periods: [
                { startDay: date( 3), endDay: date(8), name: 'Carlos P.', color: 'bg-orange-500' },
                { startDay: date( 10), endDay: date(16), name: 'Ronan Rojaime', color: 'bg-blue-500' },
                { startDay: date( 19), endDay: date(22), name: 'Natália Rojas', color: 'bg-purple-500' },
            ],
        },
        {
            id: 5,
            label: 'Villa Luxo',
            periods: [
                { startDay: date( 1), endDay: date(3), name: 'Ramona L.', color: 'bg-pink-400' },
                { startDay: date( 6), endDay: date(8), name: 'Anitta Lornavan', color: 'bg-pink-300' },
                { startDay: date( 11), endDay: date(17), name: 'Marta da Silva', color: 'bg-blue-400' },
                { startDay: date( 20), endDay: date(25), name: 'Nicole R.', color: 'bg-red-400' },
                { startDay: date( 28), endDay: date(30), name: 'Kendall M.', color: 'bg-purple-400' },
            ],
        },
        {
            id: 6,
            label: 'Cobertura Vista Mar',
            periods: [
                { startDay: date( 2), endDay: date(6), name: 'Camilla C.', color: 'bg-yellow-400' },
                { startDay: date( 9), endDay: date(12), name: 'Ontonia S.', color: 'bg-orange-400' },
                { startDay: date( 15), endDay: date(21), name: 'Tamara J.', color: 'bg-blue-600' },
            ],
        },
        {
            id: 7,
            label: 'Chalé Montanha',
            periods: [
                { startDay: date( 1), endDay: date(7), name: 'Alan T.', color: 'bg-green-500' },
                { startDay: date( 10), endDay: date(14), name: 'Gabriela T.', color: 'bg-red-500' },
                { startDay: date( 17), endDay: date(19), name: 'Julin A.', color: 'bg-blue-400' },
                { startDay: date( 22), endDay: date(28), name: 'Natasha Povas', color: 'bg-purple-500' },
            ],
        },
    ];

    return(
        <div className="p-8">
            <CalendarTimeline
                items={createCalendarItems(MOCK_PROPERTIES, MOCK_BOOKINGS)}
                year={cYear}
                month={cMonth}
            />
        </div>
    )
}



function createCalendarItems(properties : BookingProperty[], bookings : BookingResponse[]) :TimelineItemWithNames[]{
    const calendarItems :TimelineItemWithNames[] = []
    const colors = ["bg-red-500", "bg-green-500", "bg-blue-500"]
    let i = 0
    properties.forEach((p)=>{
        const id :number = Number(p.id)
        if (!isNaN(id)) {
            const bs_of_p :BookingResponse[] = bookings.filter((b) => id == b.propertyId)

            const periods : Period[] = []
            bs_of_p.forEach((b:BookingResponse)=> {
                const name: string = MOCK_USER.find((u: UserProfile) => u.id === b.userId)?.email
                    ?? "Unknown User";

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
                    label: p.title,
                    periods: periods,
                }as TimelineItemWithNames)
        }
    })

    return calendarItems
}