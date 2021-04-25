import * as Msal from "msal";
import AuthService from "./auth.service";

// An authentication service that uses the MSAL.js library to sign in users with
// either an AAD or MSA account. This leverages the AAD v2 endpoint.
class MsalAuthService extends AuthService {
    private app: Msal.UserAgentApplication;

    private applicationConfig: Msal.Configuration = {
        auth: {
            clientId: 'ff33d24d-38dc-4114-b98c-71749d18efb8',
            authority: 'https://login.microsoftonline.com/22e80a38-0d9e-4d45-a92c-356004a48f3f',
            redirectUri: `${window.location.origin}/callback/v2`
        }
    };

    private tokenRequest = {
        scopes: ["api://4x10.azurewebsites.net/ff33d24d-38dc-4114-b98c-71749d18efb8/access_as_user"]
    };

    constructor() {
        super();

        this.app = new Msal.UserAgentApplication(this.applicationConfig);
    
        this.app.handleRedirectCallback((error, response) => {
            // handle redirect response or error
        });
    }

    isCallback() {
        return this.app.isCallback(window.location.hash);
    }

    login() {
        if ((window.navigator as any).standalone) {
            this.app.loginRedirect(this.tokenRequest);
        }

        return this.app.loginPopup(this.tokenRequest).then(() => {
            return JSON.stringify(this.app.getAccount());
          });
    }

    logout() {
        this.app.logout();
    }

    getUser() {
        return Promise.resolve(this.app.getAccount());
    }

    getToken() {
        return this.app
        .acquireTokenSilent(this.tokenRequest)
        .then((accessToken) => {
            return accessToken.accessToken;
        })
        .catch((error) => {
            return this.app
            .acquireTokenPopup(this.tokenRequest)
            .then((accessToken) => {
                return accessToken.accessToken;
            })
            .catch((error) => {
                console.error(error);
            });
        });
    }
}

export default MsalAuthService;