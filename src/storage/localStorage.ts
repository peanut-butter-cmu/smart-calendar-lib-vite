import Storage from '.'

type ExpirableObject<T> = {
    value: T,
    expire_at?: number,
}

export default class LocalStorage implements Storage {
    get<T>(key: string): T | null {
        const encoded = window.localStorage.getItem(key);
        if (!encoded) 
            return null;
        const obj = JSON.parse(encoded) as ExpirableObject<T>;
        if (obj.expire_at && obj.expire_at > Date.now())
            return null;
        return obj.value;
    }

    set<T>(key: string, obj: T, expires_in?: number): void {
        const exp_obj: ExpirableObject<T> = {
            value: obj,
            expire_at: expires_in ? Date.now() + expires_in : expires_in
        }
        const encoded = JSON.stringify(exp_obj);
        window.localStorage.setItem(key, encoded);
    }

    remove(key: string): void {
        window.localStorage.removeItem(key);
    }
}
