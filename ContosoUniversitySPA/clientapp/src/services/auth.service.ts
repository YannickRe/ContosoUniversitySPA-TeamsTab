import { AuthResponse } from "msal";

abstract class AuthService {
  abstract isCallback(): boolean;

  abstract login(): Promise<string | null>;

  abstract logout(): void;

  abstract getToken(): Promise<string | void | AuthResponse>;

  abstract getUser(): Promise<any>;

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