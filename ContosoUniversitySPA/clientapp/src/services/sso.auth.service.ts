import { AccountInfo, AuthenticationResult } from "@azure/msal-common";
import * as microsoftTeams from "@microsoft/teams-js";
import AuthService from "./auth.service";
import TeamsAuthService from "./teams.auth.service";

// An authentication that will only request an access token for the logged in user.
// This token can then be used to request other resources.
class SSOAuthService extends AuthService {
    private authToken: string | null;
    private teamsAuthService: TeamsAuthService = new TeamsAuthService();

    constructor() {
        super();
        // Initialize the Teams SDK
        microsoftTeams.initialize();

        this.authToken = null;
    }

    public async handleRedirect(): Promise<AuthenticationResult | null> {
        return null;
    }

    public isCallback(): boolean {
        return this.teamsAuthService.isCallback();
    }

    public async login(): Promise<AccountInfo | null> {
        return this.teamsAuthService.login();
    }

    public async logout(): Promise<void> {
        this.teamsAuthService.logout();
    }

    private parseTokenToUser(token: string): AccountInfo {
        // parse JWT token to object
        var base64Url = token.split(".")[1];
        var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        var parsedToken = JSON.parse(window.atob(base64));
        return {
            homeAccountId: `${parsedToken.oid}.${parsedToken.tid}`,
            environment: "",
            localAccountId: parsedToken.oid,
            tenantId: parsedToken.tid,
            username: parsedToken.upn,
            name: parsedToken.name
        };
    }

    public async getUser(): Promise<AccountInfo | null> {
        return new Promise((resolve, reject) => {
            if (this.authToken) {
                resolve(this.parseTokenToUser(this.authToken));
            } else {
                this.getToken()
                .then(token => {
                    resolve(this.parseTokenToUser(token));
                })
                .catch(reason => {
                    reject(reason);
                });
            }
        });
    }

    public getToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.authToken) {
                resolve(this.authToken);
            } else {
                microsoftTeams.authentication.getAuthToken({
                    successCallback: result => {
                        this.authToken = result;
                        resolve(result);
                    },
                    failureCallback: reason => {
                        reject(reason);
                    }
                });
            }
        });
    }
}

export default SSOAuthService;