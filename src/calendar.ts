import Storage from "./storage";
import { Auth } from "./auth";
import { NO_LOGIN } from "./error";
import { CalendarEvent, CMUCred, Duration, EventGroup } from "./types";
import { ASSIGNMENT_GROUP_UUID, CLASS_GROUP_UUID, CMU_GROUP_UUID, EVENTS_KEY, FINAL_GROUP_UUID, HOLIDAY_GROUP_UUID, MIDTERM_GROUP_UUID, OWNER_GROUP_UUID, QUIZ_GROUP_UUID } from "./const";
import { UUID } from "crypto";
import { v4 as uuidv4, v4 } from 'uuid';
import { fetch_reg_info } from "./3rd/reg";
import { courses_to_event as reg_courses_to_events } from "./helpers";
import { CONFIG_RESPOSITORY } from "./repository";
import { fetch_mango_info } from "./3rd/mango";

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
    private course_groups: EventGroup[] = [];
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
            ...this.course_groups
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

    private async syncREG(cred: CMUCred, term_duration: Duration): Promise<void> {
        const reg_info = await fetch_reg_info(cred);
        const new_class_event = reg_courses_to_events(reg_info.courses, term_duration);
        const class_uuids = this.getEvents()
            .filter(({groups}) => groups.includes(CLASS_GROUP_UUID))
            .map(({id}) => id);
        this.deleteEvents(class_uuids);
        this.addEvents(new_class_event);
    }

    private async syncMango(cred: CMUCred): Promise<void> {
        const mango_info = await fetch_mango_info(cred);
        const group_uuid = new Map<number, UUID>(
            mango_info.courses.map(course => [
                course.id, 
                v4() as UUID
            ])
        ) 
        this.course_groups = mango_info.courses.map(course => ({
            id: group_uuid.get(course.id)!,
            title: course.name,
            default_color: "rgb(255, 255, 255)"
        }));
        const assignments_uuids = this.getEvents()
            .filter(({groups}) => groups.includes(ASSIGNMENT_GROUP_UUID))
            .map(({id}) => id);
        this.deleteEvents(assignments_uuids);
        this.addEvents(mango_info.events.map<CalendarEvent>(({assignment}) => ({
            id: v4() as UUID,
            title: assignment.name,
            groups: [
                ASSIGNMENT_GROUP_UUID, 
                group_uuid.get(assignment.course_id) as UUID
            ],
            date: new Date(assignment.due_at)
        })));
    }

    public override async syncEvents(): Promise<void> {
        const term_duration = CONFIG_RESPOSITORY.termDuration()
        const cred = this.getAuth().getCred();        
        if (!cred) return;
        this.syncREG(cred, term_duration);
        this.syncMango(cred);
    }
}
