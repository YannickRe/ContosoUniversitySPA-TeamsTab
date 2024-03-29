import React from "react";
import * as microsoftTeams from "@microsoft/teams-js";
import { Container, FormGroup, Input, Label } from "reactstrap";

export interface IConfigState {
    inTeamsSSO: boolean;
}

/**
 * This component is responsible for:
 * 1. Displaying configuration settings
 */
class Config extends React.Component<{}, IConfigState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      inTeamsSSO: false
    };
  }

  public componentDidMount(): void {
    microsoftTeams.initialize();

    microsoftTeams.settings.getSettings(instanceSettings => {
      const url = new URL(instanceSettings.contentUrl);
      const params = new URLSearchParams(url.search);
      this.setState({
        inTeamsSSO: !!params.get("inTeamsSSO")
      })
    })

    microsoftTeams.settings.registerOnSaveHandler((saveEvent) => {
      let contentUrl = `${window.location.origin}/?${
        this.state.inTeamsSSO ? "inTeamsSSO=true" : "inTeams=true"
      }`;

      microsoftTeams.settings.setSettings({
        entityId: "contosoUniversity",
        suggestedDisplayName: "Contoso University",
        contentUrl: contentUrl,
        websiteUrl: `${window.location.origin}/`,

      });

      saveEvent.notifySuccess();
    });
    
    microsoftTeams.settings.setValidityState(true);
  }

  public render(): React.ReactElement {
    return (
      <Container>
        <main role="main" className="pb-3">
          <FormGroup check>
              <Label check>
                  <Input type="radio" name="radio1" checked={!this.state.inTeamsSSO} onClick={() => this.setState({inTeamsSSO: false})} />{' '}
                  Interactive + Silent Authentication
              </Label>
          </FormGroup>
          <FormGroup check>
              <Label check>
                  <Input type="radio" name="radio1" checked={this.state.inTeamsSSO} onClick={() => this.setState({inTeamsSSO: true})} />{' '}
                  Teams SSO
              </Label>
          </FormGroup>
        </main>
      </Container>
    );
  }
}

export default Config;