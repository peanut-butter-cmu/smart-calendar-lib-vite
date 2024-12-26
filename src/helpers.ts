import { UUID } from "crypto";
import { CalendarEvent, Duration, RangedEvent, RegCourse } from "./types";
import { CLASS_GROUP_UUID } from "./const";

const HR_IN_MS = 3_600_000;
const MIN_IN_MS = 60_000;
function time_range_to_ms(time: string): [number, number] {
    const TIME_REGEX = /([0-9]{2})([0-9]{2})-([0-9]{2})([0-9]{2})/g;
    const MATCHES = time.matchAll(TIME_REGEX)
        .toArray()[0];
    if (!MATCHES.length || MATCHES.length < 5)
        return [0, 0];
    const START_TIME = parseInt(MATCHES[1]) * HR_IN_MS + parseInt(MATCHES[2]) * MIN_IN_MS;
    const END_TIME   = parseInt(MATCHES[3]) * HR_IN_MS + parseInt(MATCHES[4]) * MIN_IN_MS;
    return [START_TIME, END_TIME];
}

/**
 * split input days str by uppercase and map into JS day
 * @param days_str shorten day in Pascal case for example: `MTh`
 * @returns list of day index
 */
function days_str_to_js(days_str: string): number[] {
    const DAYS_MAP: Map<string, number> = new Map([
        ['m', 0],
        ['tu', 1],
        ['we', 2],
        ['th', 3],
        ['f', 4]
    ]);
    return days_str
        .split(/(?=[A-Z])/)
        .map(s => s.toLowerCase())
        .map(s => DAYS_MAP.get(s))
        .filter(d => d !== undefined);
}

const DAY_IN_MS = 86_400 * 1000;
function day_arange(start: Date, end: Date, limit: number = 10000): number[] {
    if (start.getTime() > end.getTime())
        throw new Error("start date must be before or equal to end date");
    const OUT = [];
    for (let d = start.getTime(); d <= end.getTime(); d += DAY_IN_MS)
        OUT.push(d);
    return OUT;
}

function course_to_date(course: RegCourse, duration: Duration): [Date, Date][] {
    const DAYS = days_str_to_js(course.schedule_day);
    const [start_ms, end_ms] = time_range_to_ms(course.schedule_time);
    if (start_ms > end_ms)
        throw new Error("start time must be before or equal to end time");
    return day_arange(duration.start, duration.end)
        .filter(ms => DAYS.includes(Math.floor(ms / DAY_IN_MS + 4) % 7))
        .map(ms => [new Date(ms + start_ms), new Date(ms + end_ms)])
}

export function courses_to_event(courses: RegCourse[], duration: Duration): CalendarEvent[] {
    return courses.map(course => {
        return course_to_date(course, duration).map(schedule_time => {
            const [start, end] = schedule_time;
            return {
                id: self.crypto.randomUUID() as UUID,
                title: course.title,
                start,
                end,
                groups: [CLASS_GROUP_UUID]
            }
        })
    }).flat();
}
