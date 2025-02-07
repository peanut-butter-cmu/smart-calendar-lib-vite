import ky from "ky";
import Storage from "./storage";

const API_URL = "https://smc-api.pmaw.net";

export interface Auth {
    isLoggedIn(): Boolean;
    getCred(): string | null;
    login(cred: { username: string, password: string }): Promise<void>;
    logout(): Promise<void>;
}

export class AuthClient implements Auth {
    private _storage: Storage;
    constructor(storage: Storage) {
        this._storage = storage;
    }

    isLoggedIn(): Boolean {
        return this._storage.get("token") !== null;
    }

    getCred(): string | null {
        return this._storage.get("token");
    }

    async login(cred: { username: string, password: string }): Promise<void> {
        const resp = await ky.post(`${API_URL}/user/auth`, { json: cred });
        this._storage.set("token", await resp.text())
    }

    async logout(): Promise<void> {
        this._storage.remove("token");
    }
}