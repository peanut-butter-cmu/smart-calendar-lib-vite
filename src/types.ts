import { UUID } from "crypto";

export type CMUCred = {
    username: string;
    password: string;
    mango_token: string;
};

export type StudentInfo = {
    student_no: string;
    name: string;
};

export type RegCourse = {
    course_no: string;
    title: string;
    lec_section: string;
    lab_section: string;
    lec_credit: string;
    lab_credit: string;
    schedule_day: string;
    schedule_time: string;
    type: string;
    midterm_day: string;
    midterm_time: string;
    final_day: string;
    final_time: string;
};

export type RegInfo = {
    student: StudentInfo;
    courses: RegCourse[];
};

export type Duration = {
    start: Date; 
    end: Date;
};

export type EventGroup = {
    id: UUID;
    title: string;
    default_color: string;
}

export type BaseEvent = {
    id: UUID;
    title: string;
    groups: UUID[]
};

export type OneTimeEvent = BaseEvent & {
    date: Date;
}

export type RangedEvent = BaseEvent & Duration

export type CalendarEvent = OneTimeEvent | RangedEvent