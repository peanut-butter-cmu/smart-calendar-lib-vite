import { AuthClient } from "./auth";
import SMCalendar, { SMCalendarClient } from "./calendar";
import LocalStorage from "./storage/localStorage";

export function useSMCalendar(): SMCalendar {
    const storage = new LocalStorage();
    const auth = new AuthClient(storage);
    return new SMCalendarClient(auth);
}

export type { SMCalendar };
