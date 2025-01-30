export type Duration = {
    start: Date; 
    end: Date;
};

export type EventGroup = {
    id: number;
    title: string;
    default_color: string;
};

export type BaseEvent = {
    id: number;
    title: string;
    groups: number[]
};

export type OneTimeEvent = BaseEvent & {
    date: Date;
};

export type RangedEvent = BaseEvent & Duration;

export type CalendarEvent = OneTimeEvent | RangedEvent;

export type EventGroupResp = {
    id: number;
    title: string;
}[];

export type CalendarEventResp = {
    id: number;
    title: string;
    start: Date;
    end: Date;
    groups: number[];
}[];