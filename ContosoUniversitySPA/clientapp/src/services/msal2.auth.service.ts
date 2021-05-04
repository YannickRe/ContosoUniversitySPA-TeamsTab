import { Configuration, PublicClientApplication, SilentRequest } from "@azure/msal-browser";
import { AuthenticationResult, AccountInfo } from "@azure/msal-common";
import AuthService from "./auth.service";

// An authentication service that uses the MSAL.js library to sign in users with
// either an AAD or MSA account. This leverages the AAD v2 endpoint.
class Msal2AuthService extends AuthService {
    private redirectPath: string = "/callback/v2";
    private app: PublicClientApplication;
    private applicationConfig: Configuration = {
        auth: {
            clientId: 'ff33d24d-38dc-4114-b98c-71749d18efb8',
            authority: 'https://login.microsoftonline.com/22e80a38-0d9e-4d45-a92c-356004a48f3f',
            redirectUri: `${window.location.origin}${this.redirectPath}`
        }
    };
    private tokenRequest = {
        scopes: ["api://4x10.azurewebsites.net/ff33d24d-38dc-4114-b98c-71749d18efb8/access_as_user"]
    };

    constructor() {
        super();

        this.app = new PublicClientApplication(this.applicationConfig);
    }

    public isCallback(): boolean {
        return window.location.pathname === this.redirectPath;
    }

    public async login(): Promise<AccountInfo | null> {
        let authResult: AuthenticationResult = await this.app.loginPopup(this.tokenRequest);
        if (!authResult || !authResult.account) {
            return null;
        } else {
            this.app.setActiveAccount(authResult.account);
            return authResult.account;
        }
    }

    public async logout(): Promise<void> {
        await this.app.logoutPopup();
    }

    public getUser(): Promise<AccountInfo | null> {
        let currentAccount: AccountInfo | null = this.app.getActiveAccount();
        return Promise.resolve<AccountInfo | null>(currentAccount);
    }

    public async getToken(): Promise<string | null> {
        const activeAccount = this.app.getActiveAccount();
        let silentTokenRequest: SilentRequest = this.tokenRequest;

        if (!activeAccount)
        {
            const currentAccounts = this.app.getAllAccounts();
            if (!currentAccounts || currentAccounts.length === 0) {
                return null;
            }
    
            // Only one account found, use it for silent request.
            // With more accounts, go through popup and set active account
            if (currentAccounts.length === 1) {
                this.app.setActiveAccount(currentAccounts[0]);
                silentTokenRequest.account = currentAccounts[0];
            }
        }
        else {
            silentTokenRequest.account = activeAccount;
        }

        //Try to silently acquire a token
        try {
            let authResult: AuthenticationResult = await this.app.acquireTokenSilent(silentTokenRequest);
            return authResult.accessToken;
        }
        catch (error) { 
            console.error(error);
        }

        //Silently acquiring failed, trying different method
        try {
            let authResult: AuthenticationResult = await this.app.acquireTokenPopup(this.tokenRequest);
            this.app.setActiveAccount(authResult.account);
            return authResult.accessToken;
        }
        catch (error) { 
            console.error(error);
        }

        return null;
    }
}

export default Msal2AuthService;