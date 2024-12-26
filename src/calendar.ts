import Storage from "./storage";
import { Auth } from "./auth";
import { NO_LOGIN } from "./error";
import { CalendarEvent, EventGroup } from "./types";
import { ASSIGNMENT_GROUP_UUID, CLASS_GROUP_UUID, CMU_GROUP_UUID, EVENTS_KEY, FINAL_GROUP_UUID, HOLIDAY_GROUP_UUID, MIDTERM_GROUP_UUID, OWNER_GROUP_UUID, QUIZ_GROUP_UUID } from "./const";
import { UUID } from "crypto";
import { fetch_reg_info } from "./3rd/reg";
import { courses_to_event as courses_to_events } from "./helpers";
import { CONFIG_RESPOSITORY } from "./repository";

export default interface SMCalendar {
    getAuth(): Auth;
    getGroups(): EventGroup[];
    getEvents(): CalendarEvent[];
    addEvents(events: CalendarEvent[]): void;
    updateEvents(original_event_id: UUID, new_event: Partial<Event>): void;
    deleteEvents(event_ids: UUID[]): void;
    syncEvents(): Promise<void>;
}

export class UnauthorizedSMCalendar implements SMCalendar {
    protected _auth: Auth;
    protected _storage: Storage;
    public constructor(storage: Storage, auth: Auth) {
        this._auth = auth;
        this._storage = storage;
    }

    public getAuth(): Auth {
        return this._auth;
    }

    public getGroups(): EventGroup[] {
        throw NO_LOGIN;
    }

    public getEvents(): CalendarEvent[] {
        throw NO_LOGIN;
    }

    public addEvents(_: CalendarEvent[]): void {
        throw NO_LOGIN;
    }

    public updateEvents(_: UUID, __: Partial<Event>): void {
        throw NO_LOGIN;
    }
    
    public deleteEvents(_: UUID[]): void {
        throw NO_LOGIN;
    }

    public async syncEvents(): Promise<void> {
        throw NO_LOGIN;
    }
}

export class AuthorizedSMCalendar extends UnauthorizedSMCalendar {
    public override getGroups(): EventGroup[] {
        return [
            {
                id: CMU_GROUP_UUID,
                title: "CMU",
                default_color: "rgb(97, 94, 252)"
            },
            {
                id: CLASS_GROUP_UUID,
                title: "Class",
                default_color: "rgb(65, 179, 162)"
            },
            {
                id: QUIZ_GROUP_UUID,
                title: "Quiz",
                default_color: "rgb(255, 145, 0)"
            },
            {
                id: ASSIGNMENT_GROUP_UUID,
                title: "Assignment",
                default_color: "rgb(252, 194, 109)"
            },
            {
                id: FINAL_GROUP_UUID,
                title: "Final",
                default_color: "rgb(255, 0, 0)"
            },
            {
                id: MIDTERM_GROUP_UUID,
                title: "Midterm",
                default_color: "rgb(255, 0, 0)"
            },
            {
                id: HOLIDAY_GROUP_UUID,
                title: "Holiday",
                default_color: "rgb(157, 189, 255)"
            },
            {
                id: OWNER_GROUP_UUID,
                title: "Owner",
                default_color: "rgb(214, 192, 179)"
            },
        ]
    }

    public override getEvents(): CalendarEvent[] {
        return this._storage.get<CalendarEvent[]>(EVENTS_KEY) || [];
    }

    public override addEvents(events: CalendarEvent[]): void {
        const original_events = this.getEvents();
        const new_events = [...original_events, ...events];
        this._storage.set(EVENTS_KEY, new_events);
    }

    public override updateEvents(original_event_id: UUID, new_event: Partial<Event>): void {
        const new_events = this.getEvents().map(evnt => {
            if (evnt.id == original_event_id) 
                return {...evnt, ...new_event};
            return evnt
        })
        this._storage.set(EVENTS_KEY, new_events);
    }
    
    public override deleteEvents(event_ids: UUID[]): void {
        const original_events = this.getEvents();
        const new_events = original_events.filter(evnt => event_ids.includes(evnt.id));
        this._storage.set(EVENTS_KEY, new_events);
    }

    public override async syncEvents(): Promise<void> {
        const term_duration = CONFIG_RESPOSITORY.termDuration()
        const cred = this.getAuth().getCred();        
        if (!cred) return;
        const reg_info = await fetch_reg_info(cred);
        const new_class_event = courses_to_events(reg_info.courses, term_duration);
        const class_uuids = this.getEvents()
            .filter(({groups}) => groups.includes(CLASS_GROUP_UUID))
            .map(({id}) => id);
        this.deleteEvents(class_uuids);
        this.addEvents(new_class_event);
    }
}

// export class SMCalendar {
//     private _auth: AuthService;
//     private _storage: Storage;

//     public constructor(auth: AuthService, storage: Storage) {
//         this._auth = auth;
//         this._storage = storage;
//     }

//     public getEvents(): CalendarEvent[] {
//         const [events, setEvents] = React.useState<CalendarEvent[]>([]);
//         const events_storage = this._storage.get<CalendarEvent[]>(EVENTS_KEY);
//         // if (!events_storage)
//         //     this._fetchREG().then(setEvents);
//         return events || [];
//     }

//     public getName(): string {
//         const [name, setName] = React.useState("");
//         this._getREGInfo().then(reg_info => setName(reg_info.student.name))
//         return name;
//     }

//     private async _getREGInfo(): Promise<RegInfo> {
//         let reg_info = this._storage.get<RegInfo>(REG_INFO_KEY);
//         if (!reg_info) {
//             reg_info = await this._fetchREG()
//             this._storage.set(REG_INFO_KEY, reg_info, 86_400)
//         }
//         return reg_info;
//     }

//     private async _fetchREG(): Promise<RegInfo> {
//         let cred = this._storage.get<CMUCred>(CRED_KEY);
//         if (!cred) {
//             cred = await this._login_stragety.login()
//             this._storage.set(CRED_KEY, cred)
//         }
//         return fetch_reg_info(cred);
//     }

//     public signOut() {
//         this._storage.remove(CRED_KEY);
//         this._storage.remove(EVENTS_KEY);
//     }
// }
