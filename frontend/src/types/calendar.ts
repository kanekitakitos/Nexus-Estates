import {OwnProperty} from "@/types/property";

export interface TimelineItemWithNames {
    properti : OwnProperty
    id: string;
    label: string;
    periods: period[];
}

export interface period {
    startDay: number;
    endDay: number;
    name: string;
    color: string;
}

export interface CalendarTimelineProps {
    items: TimelineItemWithNames[];
    year: number;
    month: number;
    title: string;
}
