import ky from "ky";
import { Auth } from "./auth";
import { CalendarEvent, CalendarEventResp, EventGroup, EventGroupResp, EventCreation, EventModification, User } from "./types";

const API_URL = "https://smc-api.pmaw.net";

export default interface SMCalendar {
    getAuth(): Auth;
    getGroups(): Promise<EventGroupResp[]>;
    getEvents(): Promise<CalendarEvent[]>;
    addEvent(events: EventCreation): Promise<void>;
    updateEvent(originalEventID: number, newEvent: EventModification): Promise<void>;
    deleteEvent(events: number): Promise<void>;
    getUser(): Promise<User>,
}

export class SMCalendarClient implements SMCalendar {
    private _auth: Auth;
    constructor(auth: Auth) {
        this._auth = auth;
    }

    getAuth(): Auth {
        return this._auth;
    }
    
    async getGroups(): Promise<EventGroupResp[]> {
        const resp = await ky.get(`${API_URL}/calendar/groups`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` }
        });
        return await resp.json();
    }

    async getEvents(): Promise<CalendarEvent[]> {
        const resp = await ky.get(`${API_URL}/calendar/events`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` }
        });
        return resp.json<CalendarEventResp>();
    }

    async addEvent(event: EventCreation): Promise<void> {
        await ky.post(`${API_URL}/calendar/event`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` },
            json: event
        });
    }

    async updateEvent(originalEventID: number, newEvent: EventModification): Promise<void> {
        await ky.patch(`${API_URL}/calendar/event/${originalEventID}`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` },
            json: newEvent
        });
    }

    async deleteEvent(event: number): Promise<void> {
        await ky.delete(`${API_URL}/calendar/event/${event}`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` }
        });
    }

    async getUser(): Promise<User> {
        const resp = await ky.get(`${API_URL}/user/me`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` }
        });
        return await resp.json();
    }
}