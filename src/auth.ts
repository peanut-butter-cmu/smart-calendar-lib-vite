import { CRED_KEY } from "./const";
import { reg_login } from "./3rd/reg";
import Storage from "./storage";
import { CMUCred } from "./types";

export interface Auth {
    isLoggedIn(): Boolean;
    getCred(): CMUCred | null;
    login(cred: CMUCred): Promise<void>;
    logout(): Promise<void>;
}

export class StorageAuth implements Auth {
    private _storage: Storage;
    public constructor(storage: Storage) {
        this._storage = storage;
    }

    public isLoggedIn(): Boolean {
        return this._storage.get(CRED_KEY) !== null;
    }

    public getCred(): CMUCred | null {
        return this._storage.get(CRED_KEY);
    }

    public async login(cred: CMUCred): Promise<void> {
        await reg_login(cred);
        this._storage.set(CRED_KEY, cred);
    }

    public async logout(): Promise<void> {
        this._storage.remove(CRED_KEY);
    }
}