import { BookingProperty } from "@/features/bookings/components/booking-card";
import { BookingResponse } from "@/types";
import { UserProfile } from "@/services";

export const MOCK_BOOKINGS: BookingResponse[] = [
    // --- EXISTENTES (ID 0 a 10) ---
    { id: 0, propertyId: 0, userId: 0, checkInDate: "2026-02-02", checkOutDate: "2026-02-05", guestCount: 2, totalPrice: 350, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 1, propertyId: 0, userId: 1, checkInDate: "2026-02-08", checkOutDate: "2026-02-10", guestCount: 2, totalPrice: 100, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 2, propertyId: 1, userId: 2, checkInDate: "2026-02-04", checkOutDate: "2026-02-07", guestCount: 3, totalPrice: 600, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 3, propertyId: 1, userId: 3, checkInDate: "2026-02-12", checkOutDate: "2026-02-15", guestCount: 1, totalPrice: 450, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 4, propertyId: 2, userId: 4, checkInDate: "2026-02-01", checkOutDate: "2026-02-06", guestCount: 4, totalPrice: 1200, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 5, propertyId: 3, userId: 5, checkInDate: "2026-02-10", checkOutDate: "2026-02-14", guestCount: 2, totalPrice: 800, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 6, propertyId: 3, userId: 0, checkInDate: "2026-02-16", checkOutDate: "2026-02-20", guestCount: 2, totalPrice: 750, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 7, propertyId: 3, userId: 0, checkInDate: "2026-01-16", checkOutDate: "2026-01-20", guestCount: 2, totalPrice: 750, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 8, propertyId: 2, userId: 0, checkInDate: "2026-01-16", checkOutDate: "2026-01-20", guestCount: 2, totalPrice: 750, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 9, propertyId: 3, userId: 0, checkInDate: "2026-02-28", checkOutDate: "2026-03-05", guestCount: 2, totalPrice: 750, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 10, propertyId: 3, userId: 0, checkInDate: "2026-01-28", checkOutDate: "2026-02-02", guestCount: 2, totalPrice: 750, currency: "EUR", status: "CONFIRMED" } as BookingResponse,

    // --- NOVOS (Para preencher o ano) ---

    // Primavera (Abril/Maio)
    { id: 11, propertyId: 0, userId: 2, checkInDate: "2026-04-10", checkOutDate: "2026-04-15", guestCount: 2, totalPrice: 700, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 12, propertyId: 1, userId: 4, checkInDate: "2026-05-20", checkOutDate: "2026-05-25", guestCount: 2, totalPrice: 425, currency: "EUR", status: "CONFIRMED" } as BookingResponse,

    // Verão (Junho a Agosto)
    { id: 13, propertyId: 2, userId: 1, checkInDate: "2026-06-15", checkOutDate: "2026-06-22", guestCount: 4, totalPrice: 1500, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 14, propertyId: 0, userId: 5, checkInDate: "2026-07-01", checkOutDate: "2026-07-10", guestCount: 2, totalPrice: 1350, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 15, propertyId: 3, userId: 3, checkInDate: "2026-08-12", checkOutDate: "2026-08-18", guestCount: 2, totalPrice: 900, currency: "EUR", status: "CONFIRMED" } as BookingResponse,

    // Outono (Setembro/Outubro)
    { id: 16, propertyId: 1, userId: 0, checkInDate: "2026-09-05", checkOutDate: "2026-09-10", guestCount: 1, totalPrice: 425, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 17, propertyId: 2, userId: 2, checkInDate: "2026-10-15", checkOutDate: "2026-10-20", guestCount: 3, totalPrice: 800, currency: "EUR", status: "CONFIRMED" } as BookingResponse,

    // Inverno (Novembro/Dezembro)
    { id: 18, propertyId: 0, userId: 4, checkInDate: "2026-11-20", checkOutDate: "2026-11-25", guestCount: 2, totalPrice: 750, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
    { id: 19, propertyId: 2, userId: 3, checkInDate: "2026-12-23", checkOutDate: "2026-12-30", guestCount: 5, totalPrice: 2000, currency: "EUR", status: "CONFIRMED" } as BookingResponse,
];
export const MOCK_PROPERTIES: BookingProperty[] = [
    {
        id: "0",
        title: "Villa Alpha",
        description: "Uma casa moderna com vista para o mar.",
        location: "Algarve, Portugal",
        price: 150,
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        status: "AVAILABLE",
        rating: 5,
    } as BookingProperty,
    {
        id: "1",
        title: "Apartamento Central",
        description: "No coração da cidade, perto de tudo.",
        location: "Lisboa, Portugal",
        price: 85,
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        status: "AVAILABLE",
        rating: 4,
    } as BookingProperty,
    {
        id: "2",
        title: "Cabana na Montanha",
        description: "Perfeito para quem busca paz e neve.",
        location: "Serra da Estrela, Portugal",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
        status: "AVAILABLE",
        rating: 4,
    } as BookingProperty,
    {
        id: "3",
        title: "Loft Industrial",
        description: "Estilo urbano com design minimalista.",
        location: "Porto, Portugal",
        price: 95,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        status: "AVAILABLE",
        rating: 3,
    } as BookingProperty,
];

export const MOCK_USER: UserProfile[] = [
    { id: 0, name: "Marco Reus", email: "marco@example.com", createdAt: "2024-01-01" },
    { id: 1, name: "Saul Goodman", email: "bettercall@saul.com", createdAt: "2024-01-05" },
    { id: 2, name: "Obi-Wan Kenobi", email: "highground@jedi.com", createdAt: "2024-01-10" },
    { id: 3, name: "Mike Ehrmantraut", email: "nomorehalfmeasures@security.com", createdAt: "2024-01-15" },
    { id: 4, name: "Walter White", email: "heisenberg@blue.com", createdAt: "2024-02-01" },
    { id: 5, name: "Jesse Pinkman", email: "science.yo@bitch.com", createdAt: "2024-02-02" },
];