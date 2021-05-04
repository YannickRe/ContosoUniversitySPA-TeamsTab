import AuthService from "./auth.service";
import Msal2AuthService, { SigninType } from "./msal2.auth.service";
import TeamsAuthService from "./teams.auth.service";
import SSOAuthService from "./sso.auth.service";

abstract class AuthServiceInstance {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthServiceInstance.instance) {
      const url = new URL(window.location.toString());
      const params = new URLSearchParams(url.search);
  
      // if (params.get("useTest")) {
      //    AuthServiceInstance.instance = new MockAuthService();
      // } else if (params.get("inTeams")) {
      //   AuthServiceInstance.instance = new TeamsAuthService();
      // } else if (params.get("inTeamsSSO")) {
      //   AuthServiceInstance.instance = new SSOAuthService();
      // } else {
        AuthServiceInstance.instance = new Msal2AuthService(SigninType.Popup);
      //}
    }
  
    return AuthServiceInstance.instance;
  }
}

export default AuthServiceInstance;
