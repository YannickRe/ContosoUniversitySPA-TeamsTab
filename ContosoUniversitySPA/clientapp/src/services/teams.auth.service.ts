import * as microsoftTeams from "@microsoft/teams-js";
import AuthenticationContext from "adal-angular";
import AuthService from "./auth.service";

// An authentication service that uses the ADAL.js and Teams.js library to sign in users with
// their AAD account. This leverages the AAD v1 endpoint.
class TeamsAuthService extends AuthService {
  private applicationConfig: AuthenticationContext.Options;
  private authContext: AuthenticationContext;
  private loginPromise: Promise<string> | null = null;

  public constructor() {
      super();

      // Initialize the Teams SDK
      microsoftTeams.initialize();

      // Check for any context information supplied via our QSPs
      const tenantId = "22e80a38-0d9e-4d45-a92c-356004a48f3f";
      const clientId = "ff33d24d-38dc-4114-b98c-71749d18efb8";

      // Configure ADAL
      this.applicationConfig = {
        tenant: tenantId,
        clientId: clientId,
        endpoints: {
            api: clientId,
        },
        redirectUri: `${window.location.origin}/silent-end.html`,
        cacheLocation: "localStorage",
        navigateToLoginRequestUrl: false,
      };

      this.authContext = new AuthenticationContext(this.applicationConfig);
  }

  public isCallback(): boolean {
    return this.authContext.isCallback(window.location.hash);
  }

  public login(): Promise<string>  {
    if (!this.loginPromise) {
      this.loginPromise = new Promise((resolve, reject) => {
        this.ensureLoginHint().then(() => {
          // Start the login flow
          microsoftTeams.authentication.authenticate({
            url: `${window.location.origin}/silent-start.html`,
            width: 600,
            height: 535,
            successCallback: () => {
              resolve(this.getUser());
            },
            failureCallback: (reason) => {
              reject(reason);
            },
          });
        });
      });
    }
    return this.loginPromise;
  }

  public logout(): void {
    this.authContext.logOut();
  }

  public getUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authContext.getUser((error, user) => {
        if (!error && user) {
          resolve(user.profile);
        } else {
          reject(error);
        }
      });
    });
  }

  public getToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.ensureLoginHint().then(() => {
        this.authContext.acquireToken(
          (this.applicationConfig.endpoints as any).api,
          (reason, token, error) => {
            if (!error && token) {
              resolve(token);
            } else {
              reject({ error, reason });
            }
          }
        );
      });
    });
  }

  private ensureLoginHint(): Promise<void> {
    return new Promise((resolve) => {
      microsoftTeams.getContext((context) => {
        const scopes = encodeURIComponent(
          "email openid profile offline_access User.Read"
        );

        // Setup extra query parameters for ADAL
        // - openid and profile scope adds profile information to the id_token
        // - login_hint provides the expected user name
        if (context.loginHint) {
          this.authContext.config.extraQueryParameter = `prompt=consent&scope=${scopes}&login_hint=${encodeURIComponent(
            context.loginHint
          )}`;
        } else {
          this.authContext.config.extraQueryParameter = `prompt=consent&scope=${scopes}`;
        }
        resolve();
      });
    });
  }
}

export default TeamsAuthService;