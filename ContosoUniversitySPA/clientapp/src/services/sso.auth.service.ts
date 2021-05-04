import { AccountInfo } from "@azure/msal-common";
import * as microsoftTeams from "@microsoft/teams-js";
import AuthService from "./auth.service";
import TeamsAuthService from "./teams.auth.service";

// An authentication that will only request an access token for the logged in user.
// This token can then be used to request other resources.
class SSOAuthService {
    private authToken: string | null;
    private teamsAuthService: TeamsAuthService | null = null;

    constructor() {
        //super();
        // Initialize the Teams SDK
        microsoftTeams.initialize();

        this.authToken = null;
    }

    public isCallback(): boolean {
        if (!this.teamsAuthService) {
            this.teamsAuthService = new TeamsAuthService();
        }
        return this.teamsAuthService.isCallback();
    }

    // public async login(): Promise<AccountInfo | null> {
    //     if (!this.teamsAuthService) {
    //         this.teamsAuthService = new TeamsAuthService();
    //     }
    //     return this.teamsAuthService.login();
    // }

    public logout(): void {

    }

    private parseTokenToUser(token: string) {
        // parse JWT token to object
        var base64Url = token.split(".")[1];
        var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        var parsedToken = JSON.parse(window.atob(base64));
        return {
            family_name: parsedToken.family_name || "n/a",
            given_name: parsedToken.given_name || "n/a",
            upn: parsedToken.upn,
            name: parsedToken.name
        };
    }

    public getUser(): Promise<any> {
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