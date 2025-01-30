import ky from "ky";
import { Auth } from "./auth";
import { CalendarEvent, CalendarEventResp, EventGroup, EventGroupResp } from "./types";

const API_URL = "http://localhost:3000";

export default interface SMCalendar {
    getAuth(): Auth;
    getGroups(): Promise<EventGroup[]>;
    getEvents(): Promise<CalendarEvent[]>;
    addEvents(events: CalendarEvent[]): Promise<void>;
    updateEvents(originalEventID: number, newEvent: Partial<Event>): Promise<void>;
    deleteEvents(events: number[]): Promise<void>;
}

export class SMCalendarClient implements SMCalendar {
    private _auth: Auth;
    constructor(auth: Auth) {
        this._auth = auth;
    }

    getAuth(): Auth {
        return this._auth;
    }
    
    async getGroups(): Promise<EventGroup[]> {
        const resp = await ky.get(`${API_URL}/calendar/groups`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` }
        });
        const groups = await resp.json<EventGroupResp>();
        return groups.map(group => ({
            ...group,
            default_color: "ffffff"
        }));
    }

    async getEvents(): Promise<CalendarEvent[]> {
        const resp = await ky.get(`${API_URL}/calendar/events`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` }
        });
        const events = await resp.json<CalendarEventResp>();
        return events.map(({ id, title, start, end, groups }) => {
            if (start === end) // one time
                return { id, title, groups, date: start };
            else
                return { id, title, start, end, groups }
        });
    }

    async addEvents(events: CalendarEvent[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async updateEvents(originalEventID: number, newEvent: Partial<Event>): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async deleteEvents(events: number[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
}