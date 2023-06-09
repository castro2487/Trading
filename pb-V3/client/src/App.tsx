import { ThemeProvider } from "@material-ui/core/styles";

import { HomeScreen } from "screens";
import { getThemeByName } from "themes";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  // the dynamic theme option will be sorted later
  return (
    <ThemeProvider theme={getThemeByName("dark")}>
      <Router>
        <Switch>
          <Route path="/">
            <HomeScreen />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
