import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "@holium/design-system";
import { StartMeetingPage } from "./pages/StartMeeting";
import { MeetingSpace } from "./pages/MeetingSpace";

import { rootStore, StoreProvider } from "./stores/root";

function App() {
  return (
    <StoreProvider store={rootStore}>
      <ThemeProvider theme={theme.light}>
        <BrowserRouter basename={"/apps/campfire"}>
          <Switch>
            <Route path={["/", "/call/:patp"]} exact>
              <StartMeetingPage />
            </Route>
            <Route path="/chat/:uuid">
              <MeetingSpace />
            </Route>
            {/* Catch all for anything else */}
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </BrowserRouter>
      </ThemeProvider>
    </StoreProvider>
  );
}

export default App;
