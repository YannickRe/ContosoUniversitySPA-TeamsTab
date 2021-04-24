import React from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import { INavMenuState } from './INavMenuState';
import { INavMenuProps } from './INavMenuProps';
import './NavMenu.css';

export class NavMenu extends React.Component<INavMenuProps, INavMenuState> {
    static displayName = NavMenu.name;

    constructor(props: INavMenuProps) {
        super(props);

        this.state = {
            collapsed: true
        };
    }

    private toggleNavbar(): void {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    public render(): React.ReactElement<INavMenuProps> {
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
                            </ul>
                        </Collapse>
                    </Container>
                </Navbar>
            </header>
        );
    }
}
