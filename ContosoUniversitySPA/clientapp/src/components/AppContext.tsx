import { createContext } from "react";
import { AccountInfo } from "@azure/msal-common";

type ContextProps = { 
  inTeams: boolean,
  user: AccountInfo | null
};

export const AppContext = createContext<ContextProps>({
  inTeams: false,
  user: null
});