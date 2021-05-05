import { Configuration, InteractionRequiredAuthError, PopupRequest, PublicClientApplication, SilentRequest } from "@azure/msal-browser";
import { AuthenticationResult, AccountInfo } from "@azure/msal-common";
import AuthService from "./auth.service";

export enum SigninType {
    Popup,
    Redirect
}

class Msal2AuthService extends AuthService {
    private redirectPath: string = "/callback/standalone";
    private app: PublicClientApplication;
    private applicationConfig: Configuration = {
        auth: {
            clientId: 'ff33d24d-38dc-4114-b98c-71749d18efb8',
            authority: 'https://login.microsoftonline.com/22e80a38-0d9e-4d45-a92c-356004a48f3f'
        },
        cache: {
            cacheLocation: "localStorage"
        }
    };
    private tokenRequest: PopupRequest = {
        scopes: ["api://4x10.azurewebsites.net/ff33d24d-38dc-4114-b98c-71749d18efb8/access_as_user"]
    };
    private signinType: SigninType = SigninType.Popup;

    constructor(signinType: SigninType, redirectPath: string = "/callback/standalone") {
        super();

        this.redirectPath = redirectPath;
        this.signinType = signinType;

        this.applicationConfig.auth.redirectUri = `${window.location.origin}${this.redirectPath}`;

        this.app = new PublicClientApplication(this.applicationConfig);
    }

    public async handleRedirect(): Promise<AuthenticationResult | null> {
        try {
            let authResult = await this.app.handleRedirectPromise();
            if (authResult) {
                this.handleAuthResult(authResult);
            }
            return authResult;
        }
        catch (error) {
            console.error(error);
        }
        return null;
    }

    public isSystemPath(): boolean {
        return window.location.pathname === this.redirectPath;
    }

    public async login(): Promise<AccountInfo | null> {
        if (this.signinType === SigninType.Popup) {
            let authResult: AuthenticationResult = await this.app.loginPopup({
                ...this.tokenRequest
            });
            return this.handleAuthResult(authResult);
        }
        else {
            this.app.loginRedirect({
                ...this.tokenRequest,
                redirectStartPage: `${window.location.href}`
            });
        }
        return null;
    }

    public async logout(): Promise<void> {
        if (this.signinType === SigninType.Popup) {
            await this.app.logoutPopup();
        }
        else {
            this.app.logoutRedirect();
        }
    }

    public getUser(): Promise<AccountInfo | null> {
        let currentAccount: AccountInfo | null = this.app.getActiveAccount();
        return Promise.resolve(currentAccount);
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
            if (error instanceof InteractionRequiredAuthError) {
                if (this.signinType === SigninType.Popup) {
                    try {
                        let authResult: AuthenticationResult = await this.app.acquireTokenPopup(this.tokenRequest);
                        this.app.setActiveAccount(authResult.account);
                        return authResult.accessToken;
                    }
                    catch (error) { 
                        console.error(error);
                    }
                }
                else {
                    try {
                        this.app.acquireTokenRedirect({
                            ...this.tokenRequest,
                            redirectStartPage: `${window.location.href}`
                        });
                    }
                    catch (error) { 
                        console.error(error);
                    }
                }
            } else {
                console.error(error);
            }
        }
        return null;
    }

    public setActiveAccount(account: AccountInfo): void {
        this.app.setActiveAccount(account);
    }

    private handleAuthResult(authResult: AuthenticationResult) {
        if (!authResult || !authResult.account) {
            return null;
        } else {
            this.app.setActiveAccount(authResult.account);
            return authResult.account;
        }
    }
}

export default Msal2AuthService;