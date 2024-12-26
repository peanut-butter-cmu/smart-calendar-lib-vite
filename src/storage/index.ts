export default interface Storage {
    get<T>(key: string): T | null;
    set<T>(key: string, obj: T, expires_in?: number): void;
    remove(key: string): void;
}
