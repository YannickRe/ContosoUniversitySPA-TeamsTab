import React from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from '../NavMenu/NavMenu';

export class Layout extends React.Component {
    static displayName = Layout.name;

    public render(): React.ReactElement {
        return (
            <React.Fragment>
                <NavMenu />
                <Container>
                    <main role="main" className="pb-3">
                        {this.props.children}
                    </main>
                </Container>
                <footer className="border-top footer text-muted">
                    <Container>
                        &copy; 2021 - Contoso University
                    </Container>
                </footer>
            </React.Fragment>
        );
    }
}
