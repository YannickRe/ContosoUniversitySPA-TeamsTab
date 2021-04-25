import React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout/Layout';
import './custom.css'
import { Courses } from './components/Courses/Courses';
import CourseDetail from './components/Courses/CourseDetail';
import authService from "./services/auth.service.instance";
import { Switch } from 'react-router-dom';
import { Alert, Button, Spinner } from 'reactstrap';
import { ConsentConsumer } from "./components/ConsentContext";

export interface IAppProps {

}

export interface IAppState {
    loading: boolean;
    inTeams: boolean;
    user: any;
    error: any;
}

export default class App extends React.Component<IAppProps, IAppState> {
    static displayName = App.name;

    constructor(props: any) {
        super(props);
    
        const url = new URL(window.location.toString());
        const params = new URLSearchParams(url.search);
    
        this.state = {
          loading: true,
          inTeams: !!params.get("inTeams") || !!params.get("inTeamsSSO"),
          user: null,
          error: null
        };
    }

    public async componentDidMount(): Promise<void> {
        try {
            await authService.getInstance().getToken();
            let user = await authService.getInstance().getUser();
            this.setState({
                user: user,
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
                        <Route exact path='/' component={Courses} />
                        <Route exact path='/courses' component={Courses} />
                        <Route path="/courses/details/:courseID" component={CourseDetail} />
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
            let content = <Spinner label="Signing in..." />;
            if(this.state.error) {
                content = <div className="App-error">{JSON.stringify(this.state.error)}</div>;
            }
        }

        return (
            <Layout>
                {content}
            </Layout>
        );
    }
}