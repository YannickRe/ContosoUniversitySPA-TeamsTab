import { createContext } from "react";

export const AppContext = createContext({
  inTeams: false,
  user: null
});