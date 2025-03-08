import ky from "ky";
import { Auth } from "./auth";
import { CalendarEvent, CalendarEventResp, EventGroupResp, EventCreation, EventModification, User, GroupModification , NotificationsResponse, SharedEventCreation,
  SharedEventsResponse , SharedEventResp , FCMTokenPayload , FCMTokenResponse} from "./types";

const API_URL = import.meta.env.VITE_SMC_BASE_API || "https://smc-api.pmaw.net";

export default interface SMCalendar {
    getAuth(): Auth;
    getGroups(): Promise<EventGroupResp>;
    updateGroup(groupID: number, newGroup: GroupModification): Promise<EventGroupResp>;
    getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
    addEvent(events: EventCreation): Promise<CalendarEvent>;
    updateEvent(eventID: number, newEvent: EventModification): Promise<CalendarEvent>;
    deleteEvent(events: number): Promise<void>;
    getUser(): Promise<User>;
    updateMangoToken(token: string): Promise<void>;
    getNotifications(): Promise<NotificationsResponse>;
    updateNotificationRead(NotificationsID: number): Promise<void>;
    updateNotificationsReadAll(): Promise<void>;
    addFCMToken(FCMToken: FCMTokenPayload): Promise<void>;
    getFCMToken(): Promise<FCMTokenResponse>;
    deleteFCMToken(FCMTokenID: number): Promise<void>;
    postSharedEvent(SharedEvent: SharedEventCreation): Promise<CalendarEvent>;
    getSharedEvents(): Promise<SharedEventsResponse>;
    updateSharedEvent(sharedEventId: number, newSharedEvent: SharedEventCreation): Promise<SharedEventResp>;
    deleteSharedEvent(sharedEventId: number): Promise<void>;
    postAcceptSharedEvent(sharedEventId: number): Promise<void>;
    postRejectSharedEvent(sharedEventId: number): Promise<void>;
    postArrangeSharedEvent(sharedEventId: number): Promise<SharedEventResp>;
    getSharedEvent(sharedEventId: number): Promise<SharedEventResp>;
    postSaveSharedEvent(sharedEventId: number): Promise<SharedEventResp>;
    postUserSync(): Promise<void>;
}

export class SMCalendarClient implements SMCalendar {
    private _auth: Auth;
    constructor(auth: Auth) {
        this._auth = auth;
    }

    getAuth(): Auth {
        return this._auth;
    }
    async getGroups(): Promise<EventGroupResp> { 
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

    async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
      function formatDate(date: Date) {
        return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, "0")}-${(date.getDate()).toString().padStart(2, "0")}`;
      }
      const resp = await ky.get(`${API_URL}/calendar/events`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
        searchParams: { 
          startDate: formatDate(startDate), 
          endDate: formatDate(endDate)
        }
      });
      return await resp.json<CalendarEventResp>();
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
      await ky.patch(`${API_URL}/user/mango?token=${encodeURIComponent(token)}`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
      });
    }
    
    

    async getNotifications(): Promise<NotificationsResponse> {
        const resp = await ky.get(`${API_URL}/notifications`, {
          headers: { authorization: `Bearer ${this._auth.getCred()}` },
        });
        return await resp.json();
      }

      async updateNotificationRead(NotificationsID: number): Promise<void> {
        await ky.patch(`${API_URL}/notification/${NotificationsID}/read`, {
          headers: { authorization: `Bearer ${this._auth.getCred()}` },
        });
      }

      async updateNotificationsReadAll(): Promise<void> {
        await ky.patch(`${API_URL}/notifications/read-all`, {
          headers: { authorization: `Bearer ${this._auth.getCred()}` },
        });
      }

      async addFCMToken(FCMToken: FCMTokenPayload): Promise<void> {
        await ky.post(`${API_URL}/user/fcm`, {
          headers: { authorization: `Bearer ${this._auth.getCred()}` },
          json: FCMToken
        });
      }

      async getFCMToken(): Promise<FCMTokenResponse> {
        const resp = await ky.get(`${API_URL}/user/fcm`, {
          headers: { authorization: `Bearer ${this._auth.getCred()}` },
        });
        return await resp.json();
      }

      async deleteFCMToken(FCMTokenID: number): Promise<void> {
        await ky.delete(`${API_URL}/user/fcm/${FCMTokenID}`, {
            headers: { authorization: `Bearer ${this._auth.getCred()}` }
        });
    }
      
    async postSharedEvent(sharedEvent: SharedEventCreation): Promise<CalendarEvent> {
      const resp = await ky.post(`${API_URL}/calendar/event/shared`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
        json: sharedEvent,
      });
      return await resp.json<CalendarEvent>();
    }

    async getSharedEvents(): Promise<SharedEventsResponse> {
      const resp = await ky.get(`${API_URL}/calendar/events/shared`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
      });
      return await resp.json<SharedEventsResponse>();
    }

    async updateSharedEvent(sharedEventId: number, newSharedEvent: SharedEventCreation): Promise<SharedEventResp> {
      const resp = await ky.patch(`${API_URL}/calendar/event/shared/${sharedEventId}`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
        json: newSharedEvent,
      });
      return await resp.json<SharedEventResp>();
    }

    async deleteSharedEvent(sharedEventId: number): Promise<void> {
      await ky.delete(`${API_URL}/calendar/event/shared/${sharedEventId}`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
      });
    }

    async postAcceptSharedEvent(sharedEventId: number): Promise<void> {
      await ky.post(`${API_URL}/calendar/event/shared/${sharedEventId}/accept`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
      });
    }

    async postRejectSharedEvent(sharedEventId: number): Promise<void> {
      await ky.post(`${API_URL}/calendar/event/shared/${sharedEventId}/reject`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
      });
    }

    async postArrangeSharedEvent(sharedEventId: number): Promise<SharedEventResp> {
      const resp = await ky.post(`${API_URL}/calendar/event/shared/${sharedEventId}/arrange`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
      });
      return await resp.json<SharedEventResp>();
    }

    async getSharedEvent(sharedEventId: number): Promise<SharedEventResp> {
      const resp = await ky.get(`${API_URL}/calendar/event/shared/${sharedEventId}`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
      });
      return await resp.json<SharedEventResp>();
    }

    async postSaveSharedEvent(sharedEventId: number): Promise<SharedEventResp> {
      const resp = await ky.post(`${API_URL}/calendar/event/shared/${sharedEventId}/save`, {
        headers: { authorization: `Bearer ${this._auth.getCred()}` },
      });
      return await resp.json<SharedEventResp>();
    }
    
    async postUserSync(): Promise<void> {
      await ky.post(`${API_URL}/user/sync`, {
          headers: { authorization: `Bearer ${this._auth.getCred()}` },
      });
  }
}

