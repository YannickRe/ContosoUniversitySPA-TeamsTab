import * as microsoftTeams from "@microsoft/teams-js";
import AuthService from "./auth.service";
import Msal2AuthService, { SigninType } from "./msal2.auth.service";
import { AccountInfo } from "@azure/msal-common";
import { AuthenticationResult } from "@azure/msal-browser";

class TeamsAuthService extends AuthService {
  private loginPromise: Promise<AccountInfo | null> | null = null;
  private msal2AuthService: Msal2AuthService = new Msal2AuthService(SigninType.Redirect, '/silent-end');

  public constructor() {
    super();

    // Initialize the Teams SDK
    microsoftTeams.initialize();
  }

  public async handleRedirect(): Promise<AuthenticationResult | null> {
    var result = await this.msal2AuthService.handleRedirect();
    if (result) {
      microsoftTeams.authentication.notifySuccess(JSON.stringify(result.account));
    }
    return result;
  }

  public isCallback(): boolean {
    return this.msal2AuthService.isCallback();
  }

  public login(): Promise<AccountInfo | null>  {
    const url = new URL(window.location.toString());
    if (url.pathname === '/silent-start') {
      this.msal2AuthService.login();
    }
    else {
      if (!this.loginPromise) {
        this.loginPromise = new Promise<AccountInfo | null>(async (resolve, reject) => {
          // Start the login flow
          microsoftTeams.authentication.authenticate({
            url: `${window.location.origin}/silent-start`,
            width: 600,
            height: 535,
            successCallback: (account) => {
              if (account)
              {
                this.msal2AuthService.setActiveAccount(JSON.parse(account));
              }
              resolve(this.getUser());
            },
            failureCallback: (reason) => {
              reject(reason);
            },
          });
        });
      }
      return this.loginPromise;
    }
    return Promise.resolve(null);
  }

  public async logout(): Promise<void> {
    await this.msal2AuthService.logout();
  }

  public getUser(): AccountInfo | null {
    return this.msal2AuthService.getUser();
  }

  public async getToken(): Promise<string | null> {
    return await this.msal2AuthService.getToken();
  }
}

export default TeamsAuthService;