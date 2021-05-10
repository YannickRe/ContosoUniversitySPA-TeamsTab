import React from 'react';
import { Redirect, Route } from 'react-router';
import { Layout } from './components/Layout/Layout';
import './custom.css'
import { Courses } from './components/Courses/Courses';
import CourseDetail from './components/Courses/CourseDetail';
import authService from "./services/auth.service.instance";
import { Switch } from 'react-router-dom';
import { Button, Spinner } from 'reactstrap';
import Config from './components/Config/Config';
import CourseCreate from './components/Courses/CourseCreate';
import CourseDelete from './components/Courses/CourseDelete';
import { AppContext } from './components/AppContext';
import * as microsoftTeams from "@microsoft/teams-js";
import { Barcode } from './components/Barcode/Barcode';
import { AccountInfo } from "@azure/msal-common";
import CourseEdit from './components/Courses/CourseEdit';
import { Students } from './components/Students/Students';
import StudentDetail from './components/Students/StudentDetail';
import StudentDelete from './components/Students/StudentDelete';
import StudentCreate from './components/Students/StudentCreate';
import StudentEdit from './components/Students/StudentEdit';

export interface IAppProps {

}

export interface IAppState {
    loading: boolean;
    inTeams: boolean;
    user: AccountInfo | null;
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

            await authService.getInstance().handleRedirect();
            let token = await authService.getInstance().getToken();
            if (token) {
                await authService.getInstance().validateConsent();
            }
            let user = await authService.getInstance().getUser();
            this.setState({
                user: user,
                redirectPath: redirectUri,
                loading: false,
                error: null
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
        this.setState({ loading: true, user: null, error: null });
        try {
            let user = await authService.getInstance().login();
            if (user) {
              this.setState({ user: user, loading: false, error: null });
            } else {
              this.setState({ loading: false, error: null });
            }
        }
        catch(error) {
            this.setState({ loading: false, error: error });
        }
    };

    private isInvalidGrant(): boolean {
        return this.state.error?.errorCode === 'invalid_grant' || false;
    }

    public render() {
        if (authService.getInstance().isSystemPath()) {
            return null;
        }

        let userContent =   <React.Fragment>
                                <Route exact path="/">
                                    {this.state.redirectPath ? <Redirect to={this.state.redirectPath} /> : <Courses />}
                                </Route>
                                <Route exact path='/barcode' component={Barcode} />
                                <Route exact path='/courses' component={Courses} />
                                <Route path="/courses/edit/:courseID" component={CourseEdit} />
                                <Route path="/courses/details/:courseID" component={CourseDetail} />
                                <Route path="/courses/delete/:courseID" component={CourseDelete} />
                                <Route path="/courses/create/" component={CourseCreate} />
                                <Route exact path='/students' component={Students} />
                                <Route path="/students/edit/:studentID" component={StudentEdit} />
                                <Route path="/students/details/:studentID" component={StudentDetail} />
                                <Route path="/students/delete/:studentID" component={StudentDelete} />
                                <Route path="/students/create/" component={StudentCreate} />
                            </React.Fragment>;
        
        if (!this.state.user || this.isInvalidGrant()) {
            userContent =   <div className="App-login">
                                <div className="jumbotron">
                                    <h1 className="display-4">Sign in required</h1>
                                    <p className="lead">Contoso University application requires you to login with your work or school account.</p>
                                    <hr className="my-4" />
                                    <p>Please click the button to start the sign in process.</p>
                                    <p className="lead">
                                        <Button color="primary" className="btn-lg" onClick={async () => await this.login()}>Sign in</Button>
                                    </p>
                                </div>
                            </div>;
            if (this.isInvalidGrant()) {
                userContent =   <div className="App-login">
                                    <div className="jumbotron">
                                        <h1 className="display-4">Consent required</h1>
                                        <p className="lead">Contoso University application requires you to login with your work or school account.</p>
                                        <hr className="my-4" />
                                        <p>Contoso University has undergone changes and requires some additional consent to work correctly. Please click the button to start the consent process.</p>
                                        <p className="lead">
                                            <Button color="primary" className="btn-lg" onClick={async () => await this.login()}>Give consent</Button>
                                        </p>
                                    </div>
                                </div>;
            }
        }

        if (this.state.loading) {
            userContent = <Spinner label="Busy" />;
        }

        let errorContent = null;
        if(this.state.error && !this.isInvalidGrant()) {
            errorContent = <div className="alert alert-danger" role="alert">
                                <h4 className="alert-heading">An error occurred</h4>
                                <p>We regret to inform you that an error has occurred while working with the Contoso University applications, more details below.</p>
                                <hr />
                                <p className="mb-0"><pre>{JSON.stringify(this.state.error, null, 2)}</pre></p>
                            </div>;
        }

        return (
            <AppContext.Provider value={this.state}>
                <Switch>
                    <Route path="/config" component={Config} />
                    <Layout>
                        {errorContent}
                        {userContent}
                    </Layout>
                </Switch>
            </AppContext.Provider>
        );
    }
}