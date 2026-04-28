import {PropertyListItem} from "@/types/property";

export interface TimelineItemWithNames {
    properti?: PropertyListItem
    id: number;
    label?: string;
    periods: Period[];
}

export interface Period {
    startDay: Date;
    endDay: Date;
    name?: string;
    color: string;
}


