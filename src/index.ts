import SMCalendar, { AuthorizedSMCalendar, UnauthorizedSMCalendar } from "./calendar";
import LocalStorage from "./storage/localStorage";
import Storage from "./storage";
import { Auth, StorageAuth } from "./auth";

export function useSMCalendar(storage?: Storage, auth?: Auth): SMCalendar {
    storage = storage || new LocalStorage;
    auth = auth || new StorageAuth(storage);
    if (auth.isLoggedIn())
        return new AuthorizedSMCalendar(storage, auth)
    return new UnauthorizedSMCalendar(storage, auth);
}

export type { SMCalendar };
