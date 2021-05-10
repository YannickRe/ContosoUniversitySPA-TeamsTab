import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Spinner, Table } from 'reactstrap';
import { Student } from '../../models/Student';
import authService from "../../services/auth.service.instance";
import { AppContext } from '../AppContext';

export interface IStudentsProps extends RouteComponentProps<any> {

}

export interface IStudentsState {
    students: Student[];
    loading: boolean;
}

export class Students extends React.Component<IStudentsProps, IStudentsState> {
    static displayName = Students.name;

    constructor(props: IStudentsProps) {
        super(props);

        this.state = { 
            students: [], 
            loading: true 
        };
    }

    public componentDidMount(): void {
        this.loadStudents();
    }

    public static renderTable(students: Student[]): React.ReactElement {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Last Name</th>
                        <th>First Name</th>
                        <th>Enrollment Date</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(item =>
                        <tr key={item.id}>
                            <th scope="row">{item.lastName}</th>
                            <td>{item.firstName}</td>
                            <td>{item.enrollmentDate}</td>
                            <td><Link to={`/students/edit/${item.id}`}>Edit</Link> | <Link to={`/students/details/${item.id}`}>Details</Link> | <Link to={`/students/delete/${item.id}`}>Delete</Link></td>
                        </tr>
                    )}
                </tbody>
            </Table>
        );
      }

    public render(): React.ReactElement<IStudentsProps> {
        let contents = this.state.loading ? <Spinner type="grow" color="primary" /> : Students.renderTable(this.state.students);
        let barcodeUrl = null;
        if (this.context.inTeams) {
           barcodeUrl = <React.Fragment>{' '}| <Link to={`/barcode`}>Find Student by QR code</Link></React.Fragment>
        }

        return (
            <React.Fragment>
                <h1>Students</h1>
                <p>
                    <Link to={`/students/create`}>Create New</Link>{barcodeUrl}
                </p>
                {contents}
            </React.Fragment>
        );
    }

    private async loadStudents(): Promise<void> {
        const response = await authService.getInstance().fetch('api/students');
        const data = await response.json();
        this.setState({ 
            students: data, 
            loading: false 
        });
    }
}


Students.contextType = AppContext;

export default withRouter(Students);