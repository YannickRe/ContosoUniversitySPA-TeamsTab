import * as microsoftTeams from "@microsoft/teams-js";
import Msal2AuthService, { SigninType } from "./msal2.auth.service";
import { AccountInfo } from "@azure/msal-common";
import { AuthenticationResult } from "@azure/msal-browser";

class TeamsAuthService extends Msal2AuthService {
  public static authStartPath: string = "/auth/teams";
  public static authEndPath: string = "/callback/teams";

  public constructor() {
    super(SigninType.Redirect, TeamsAuthService.authEndPath);

    // Initialize the Teams SDK
    microsoftTeams.initialize();
  }

  public isSystemPath(): boolean {
    return window.location.pathname === TeamsAuthService.authStartPath || window.location.pathname === TeamsAuthService.authEndPath;
  }

  public async handleRedirect(): Promise<AuthenticationResult | null> {
    const url = new URL(window.location.toString());
    if (url.pathname === TeamsAuthService.authStartPath) {
      super.login();
    }

    var result = await super.handleRedirect();
    if (result) {
      microsoftTeams.authentication.notifySuccess(JSON.stringify(result.account));
    }
    return result;
  }

  public login(): Promise<AccountInfo | null>  {
    return new Promise<AccountInfo | null>(async (resolve, reject) => {
      // Start the login flow
      microsoftTeams.authentication.authenticate({
        url: `${window.location.origin}${TeamsAuthService.authStartPath}`,
        width: 600,
        height: 535,
        successCallback: (account) => {
          if (account)
          {
            this.setActiveAccount(JSON.parse(account));
          }
          resolve(this.getUser());
        },
        failureCallback: (reason) => {
          reject(reason);
        },
      });
    });
  }
}

export default TeamsAuthService;