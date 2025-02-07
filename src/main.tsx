import { useSMCalendar } from ".";
import React from "react";
import ReactDOM from "react-dom/client";

const smCalendar = useSMCalendar();
smCalendar.getAuth().login({ username: import.meta.env.VITE_CMU_USER, password: import.meta.env.VITE_CMU_PASS }).then(async () => {
  console.log(await smCalendar.addEvent({
    title: "x",
    start: new Date(),
    end: new Date(),
  }))
})
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    Use this to run a local development environment of the library for testing
  </React.StrictMode>
);
