import ky from "ky";
import { Auth } from "./auth";
import { CalendarEvent, CalendarEventResp, EventGroupResp, EventCreation, EventModification, User, GroupModification } from "./types";

const API_URL = import.meta.env.VITE_SMC_BASE_API || "https://smc-api.pmaw.net";

export default interface SMCalendar {
    getAuth(): Auth;
    getGroups(): Promise<EventGroupResp[]>;
    updateGroup(groupID: number, newGroup: GroupModification): Promise<EventGroupResp>;
    getEvents(): Promise<CalendarEvent[]>;
    addEvent(events: EventCreation): Promise<CalendarEvent>;
    updateEvent(eventID: number, newEvent: EventModification): Promise<CalendarEvent>;
    deleteEvent(events: number): Promise<void>;
    getUser(): Promise<User>;
    updateMangoToken(token: string): Promise<void>;
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

    async updateGroup(groupID: number, newGroup: GroupModification): Promise<EventGroupResp> {
        const resp = await ky.patch(`${API_URL}/calendar/group/${groupID}`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` },
            json: newGroup
        });
        return resp.json();
    }

    async getEvents(): Promise<CalendarEvent[]> {
        const resp = await ky.get(`${API_URL}/calendar/events`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` }
        });
        return resp.json<CalendarEventResp>();
    }

    async addEvent(event: EventCreation): Promise<CalendarEvent> {
        const resp = await ky.post(`${API_URL}/calendar/event`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` },
            json: event
        });
        return resp.json();
    }

    async updateEvent(eventID: number, newEvent: EventModification): Promise<CalendarEvent> {
        const resp = await ky.patch(`${API_URL}/calendar/event/${eventID}`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` },
            json: newEvent
        });
        return resp.json();
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

    async updateMangoToken(token: string): Promise<void> {
        await ky.patch(`${API_URL}/user/mango?token=${token}`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` }
        }); 
    }
}