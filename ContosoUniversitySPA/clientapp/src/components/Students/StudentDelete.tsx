import React from 'react';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import { Student } from '../../models/Student';
import { withRouter } from "react-router";
import { Spinner } from 'reactstrap';
import authService from "../../services/auth.service.instance";

export interface IStudentDeleteProps extends RouteComponentProps<any> {

}

export interface IStudentDeleteState {
    student: Student | null;
    loading: boolean;
    success: boolean;
}

class StudentDelete extends React.Component<IStudentDeleteProps, IStudentDeleteState> {
    static displayName = StudentDelete.name;

    constructor(props: IStudentDeleteProps) {
        super(props);

        this.state = { 
            student: null, 
            loading: true,
            success: false
        };
    }

    public componentDidMount(): void {
        this.loadStudent();
    }

    public render(): React.ReactElement {
        if (this.state.success) {
            return <Redirect to="/students" />;
        }

        let contents = <Spinner type="grow" color="primary" />;

        if (!this.state.loading) {
            contents = <React.Fragment>
                <div>
                    <h4>Student</h4>
                    <hr />
                    <dl className="row">
                        <dt className="col-sm-2">
                            Number
                        </dt>
                        <dd className="col-sm-10">
                            {this.state.student?.id}
                        </dd>
                        <dt className="col-sm-2">
                            Last Name
                        </dt>
                        <dd className="col-sm-10">
                            {this.state.student?.lastName}
                        </dd>
                        <dt className="col-sm-2">
                            First Name
                        </dt>
                        <dd className="col-sm-10">
                            {this.state.student?.firstName}
                        </dd>
                        <dt className="col-sm-2">
                            Enrollment Date
                        </dt>
                        <dd className="col-sm-10">
                            {this.state.student?.enrollmentDate}
                        </dd>
                    </dl>
                </div>
                <div>
                    <input type="button" value="Delete" className="btn btn-danger" onClick={async (event) => { await this.handleDelete(event); }} /> | <Link to={`/students`}>Back to List</Link>
                </div>
            </React.Fragment>
        }


        return (
            <React.Fragment>
                <h1>Delete</h1>
                <h3>Are you sure you want to delete this?</h3>
                {contents}
            </React.Fragment>
        );
    }
    private async handleDelete(event: React.MouseEvent<HTMLInputElement, MouseEvent>): Promise<void> {
        event.preventDefault();

        await authService.getInstance().fetch(`api/students/${this.state.student?.id}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        }
                                    });

        this.setState({
            success: true,
            loading: false,
            student: null
        });
    }

    private async loadStudent(): Promise<void> {
        const response = await authService.getInstance().fetch(`api/students/${this.props.match.params.studentID}`);
        const data = await response.json();
        this.setState({ 
            student: data, 
            loading: false 
        });
      }
}

export default withRouter(StudentDelete);