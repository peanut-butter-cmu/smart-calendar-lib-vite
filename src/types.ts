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

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type CalendarEvent = RangedEvent;
export type EventCreation = Omit<CalendarEvent, "id" | "groups">;
export type EventModification = Partial<Optional<Omit<CalendarEvent, "id">, "groups">>;

export type EventGroupResp = {
    id: number;
    title: string;
    color: string;
}[];

export type CalendarEventResp = {
    id: number;
    title: string;
    start: Date;
    end: Date;
    groups: number[];
}[];

export type User = {
    studentNo: number;
    firstName: string;
    middleName: string;
    lastName: string;
};