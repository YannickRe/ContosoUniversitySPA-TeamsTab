import AuthService from "./auth.service";
import MockAuthService from "./mock.auth.service";
import MsalAuthService from "./msal.auth.service";
import TeamsAuthService from "./teams.auth.service";
import SSOAuthService from "./sso.auth.service";

abstract class AuthServiceInstance {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthServiceInstance.instance) {
      const url = new URL(window.location.toString());
      const params = new URLSearchParams(url.search);
  
      if (params.get("useTest")) {
         AuthServiceInstance.instance = new MockAuthService();
      } else if (params.get("inTeams")) {
        AuthServiceInstance.instance = new TeamsAuthService();
      } else if (params.get("inTeamsSSO")) {
        AuthServiceInstance.instance = new SSOAuthService();
      } else {
        AuthServiceInstance.instance = new MsalAuthService();
      }
    }
  
    return AuthServiceInstance.instance;
  }
}

export default AuthServiceInstance;
