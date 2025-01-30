import { useSMCalendar } from ".";
import React from "react";
import ReactDOM from "react-dom/client";

const smCalendar = useSMCalendar();
smCalendar.getAuth().login({ username: "perapol_p", password: "d:q!_Vej5zS6R3\"" }).then(async () => {
  console.log(await smCalendar.getEvents())
})
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    Use this to run a local development environment of the library for testing
  </React.StrictMode>
);
