import React from "react";
import { createContext } from "react";
import authService from "../services/auth.service.instance";

const ConsentContext = createContext({
  consentRequired: false,
  setConsentRequired: (consentRequired: boolean) => {},
  requestConsent: () => {}
});

export interface IConsentProviderState {
    consentRequired: boolean;
    setConsentRequired: (consentRequired: boolean) => void;
    requestConsent: () => void;
}

export class ConsentProvider extends React.Component<{}, IConsentProviderState> {
  constructor(props: {}) {
      super(props);

      this.state = {
          consentRequired: false,
          setConsentRequired: this.setConsentRequired,
          requestConsent: this.requestConsent
      };
  }
  
  private setConsentRequired(consentRequired: boolean) {
      this.setState({ consentRequired: consentRequired });
  };
  
  private requestConsent() {
      authService.getInstance().login().then(() => this.setState({ consentRequired: false }));
  };

  public render(): React.ReactElement {
    return (
      <ConsentContext.Provider value={this.state}>
        {this.props.children}
      </ConsentContext.Provider>
    );
  }
}

export const ConsentConsumer = ConsentContext.Consumer;