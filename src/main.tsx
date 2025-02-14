import { useSMCalendar } from ".";
import React from "react";
import ReactDOM from "react-dom/client";
import { ReminderOptions } from "./types";

const smCalendar = useSMCalendar();
smCalendar.getAuth().login({
  username: import.meta.env.VITE_CMU_USER, 
  password: import.meta.env.VITE_CMU_PASS
}).then(async () => {
  console.log(await smCalendar.updateGroup(1, {
    reminders: [ ReminderOptions.AT_TIME_EVENT ]
  }));
})
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    Use this to run a local development environment of the library for testing
  </React.StrictMode>
);
