import { Duration } from "../types";

class ConfigRepository {
    public termDuration(): Duration {
        return {
            start: new Date("2024-11-11 GMT+7"),
            end: new Date("2025-03-07 GMT+7")
        }
    }
}

export const CONFIG_RESPOSITORY = new ConfigRepository;
