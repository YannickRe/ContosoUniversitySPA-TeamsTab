import React from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import { INavMenuState } from './INavMenuState';
import { INavMenuProps } from './INavMenuProps';
import './NavMenu.css';
import authService from '../../services/auth.service.instance';
import { TeamsContext } from '../TeamsContext';

export class NavMenu extends React.Component<INavMenuProps, INavMenuState> {
    static displayName = NavMenu.name;

    constructor(props: INavMenuProps) {
        super(props);

        this.state = {
            collapsed: true,
            user: null
        };
    }

    public async componentDidMount(): Promise<void> {
        try {
            await authService.getInstance().getToken();
            let user = await authService.getInstance().getUser();
            this.setState({
                user: user
            });
        }
        catch(error) {
            this.setState({
                user: null
            });
        }
    }

    private toggleNavbar(): void {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    public render(): React.ReactElement<INavMenuProps> {
        let userControl = null;
        if (this.state.user) {
            const style = {
                marginLeft: 'auto'
            };

            userControl = <React.Fragment>
                <li className="nav-item" style={style}>
                    <span className="navbar-text text-dark">Hello {this.state.user.displayableId || this.state.user.upn || this.state.user.userName}</span>
                </li>
            </React.Fragment>;
        }

        let teamsOnlyLink = null;
        if (this.context.inTeams) {
            teamsOnlyLink = <NavItem>
                                <NavLink tag={Link} className="text-dark" to="/barcode">Barcode</NavLink>
                            </NavItem>;
        }

        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand tag={Link} to="/">Contoso University</NavbarBrand>
                        <NavbarToggler onClick={() => this.toggleNavbar()} className="mr-2" />
                        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
                            <ul className="navbar-nav flex-grow-1">
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/courses">Courses</NavLink>
                                </NavItem>
                                {teamsOnlyLink}
                                {userControl}
                            </ul>
                        </Collapse>
                    </Container>
                </Navbar>
            </header>
        );
    }
}

NavMenu.contextType = TeamsContext;