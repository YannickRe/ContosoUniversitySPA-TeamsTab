import { AccountInfo } from "@azure/msal-common";
import * as microsoftTeams from "@microsoft/teams-js";
import TeamsAuthService from "./teams.auth.service";

class SSOAuthService extends TeamsAuthService {
    private authToken: string | null;

    constructor() {
        super();

        this.authToken = null;
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
                    successCallback: async result => {
                        this.authToken = result;
                        resolve(this.authToken);
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