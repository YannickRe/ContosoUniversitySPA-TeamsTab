
import { AccountInfo, AuthenticationResult } from "@azure/msal-common";

abstract class AuthService {
  abstract handleRedirect(): Promise<AuthenticationResult | null>;

  abstract isSystemPath(): boolean;

  abstract login(loginhint?: string): Promise<AccountInfo | null>;

  abstract logout(): Promise<void>;

  abstract getToken(): Promise<string | null>;

  abstract getUser(): Promise<AccountInfo | null>;

  // Does an authenticated fetch by acquiring and appending the Bearer token for our backend
  public async fetch(url: RequestInfo, options?: RequestInit | undefined): Promise<Response> {
    return this.getToken().then(token => {
      options = options || {};

      var headers = new Headers(options.headers || {});
      headers.set('Authorization', `Bearer ${token}`);

      options.headers = headers;
      return fetch(url, options);
    });
  }
}

export default AuthService;