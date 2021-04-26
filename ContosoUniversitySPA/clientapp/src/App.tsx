import React from 'react';
import { Redirect, Route } from 'react-router';
import { Layout } from './components/Layout/Layout';
import './custom.css'
import { Courses } from './components/Courses/Courses';
import CourseDetail from './components/Courses/CourseDetail';
import authService from "./services/auth.service.instance";
import { Switch } from 'react-router-dom';
import { Alert, Button, Spinner } from 'reactstrap';
import { ConsentConsumer } from "./components/ConsentContext";
import Config from './components/Config/Config';
import CourseCreate from './components/Courses/CourseCreate';
import CourseDelete from './components/Courses/CourseDelete';
import { TeamsContext } from './components/TeamsContext';
import * as microsoftTeams from "@microsoft/teams-js";
import { Barcode } from './components/Barcode/Barcode';

export interface IAppProps {

}

export interface IAppState {
    loading: boolean;
    inTeams: boolean;
    user: any;
    error: any;
    redirectPath?: string;
}

export default class App extends React.Component<IAppProps, IAppState> {
    static displayName = App.name;
    private url: URL;
    private params: URLSearchParams;

    constructor(props: any) {
        super(props);
    
        this.url = new URL(window.location.toString());
        this.params = new URLSearchParams(this.url.search);
    
        this.state = {
          loading: true,
          inTeams: !!this.params.get("inTeams") || !!this.params.get("inTeamsSSO"),
          user: null,
          error: null
        };
    }

    public async componentDidMount(): Promise<void> {
        try {
            let redirectUri = undefined;
            if (this.state.inTeams) {
                redirectUri = await this.processDeepLink();
            }

            await authService.getInstance().getToken();
            let user = await authService.getInstance().getUser();
            this.setState({
                user: user,
                redirectPath: redirectUri,
                loading: false,
                error: null,
            });
        }
        catch(error) {
            this.setState({
                user: null,
                loading: false,
                error: error,
            });
        }
    }

    private processDeepLink(): Promise<string | undefined> {
        return new Promise((resolve) => {
          microsoftTeams.getContext(context => {
              resolve(context.subEntityId);
          });
        });
      }

    private async login(): Promise<void> {
        this.setState({ loading: true });
        try {
            let user = await authService.getInstance().login();
            if (user) {
              this.setState({ user, loading: false });
            } else {
              this.setState({ loading: false });
            }
        }
        catch(error) {
            console.error(error);
            this.setState({ loading: false });
        }
    };

    public render() {
        let content = null;

        if (this.url.pathname === '/config') {
            content = <Route path="/config" component={Config} />;
        } else {
            if (!authService.getInstance().isCallback()) {
                content = <Spinner label="Authenticating..." />
                
                if (!this.state.loading) {

                    let userContent = <div className="App-login">
                    <div className="App-login-button-container">
                        <Button color="primary"onClick={async () => await this.login()}>

                        <span className="ms-Button-label label-46">Sign in</span>
                        </Button>
                    </div>
                    </div>;

                    if (this.state.user) {
                        userContent = <Switch>
                            <Route exact path="/">
                                {this.state.redirectPath ? <Redirect to={this.state.redirectPath} /> : <Courses />}
                            </Route>
                            <Route exact path='/courses' component={Courses} />
                            <Route exact path='/barcode' component={Barcode} />
                            <Route path="/courses/details/:courseID" component={CourseDetail} />
                            <Route path="/courses/delete/:courseID" component={CourseDelete} />
                            <Route path="/courses/create/" component={CourseCreate} />
                        </Switch>;
                    }


                    content = <React.Fragment>
                                <ConsentConsumer>
                                    {({ consentRequired, requestConsent }) =>
                                    consentRequired && (
                                        <Alert color="warning">
                                            Contoso University needs your consent in order to do its work.
                                            <Button color="primary"onClick={() => requestConsent()}></Button>
                                        </Alert>
                                    )
                                    }
                                </ConsentConsumer>
                                {userContent}
                            </React.Fragment>;
                }
            }
            else {
                content = <Spinner label="Signing in..." />;
                if(this.state.error) {
                    content = <div className="App-error">{JSON.stringify(this.state.error)}</div>;
                }
            }
        }

        return (
            <TeamsContext.Provider value={this.state}>
                <Layout>
                    {content}
                </Layout>
            </TeamsContext.Provider>
        );
    }
}