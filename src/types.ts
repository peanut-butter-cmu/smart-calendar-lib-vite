export type Duration = {
    start: Date; 
    end: Date;
};

export enum Priority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3
};

export enum ReminderOptions {
    AT_TIME_EVENT = 0, 
    FIVE_MINUTES = 5,
    TEN_MINUTES = 10,
    FIFTEEN_MINUTES = 15,
    THIRTY_MINUTES = 30,
    ONE_HOUR = 60,
    TWO_HOURS = 120,
    ONE_DAY = 1440, // 24 hours * 60 minutes
    TWO_DAYS = 2880, // 48 hours * 60 minutes
    ONE_WEEK = 10080 // 7 days * 24 hours * 60 minutes
}

export type EventGroup = {
    id: number;
    title: string;
    color: string;
    priority: Priority;
    isBusy: boolean;
    reminders: ReminderOptions[]
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
export type CalendarEvent = RangedEvent;
export type EventCreation = Omit<CalendarEvent, "id" | "groups">;
export type EventModification = Partial<Omit<CalendarEvent, "id">>;
export type GroupModification = Partial<Omit<EventGroup, "id">>;

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