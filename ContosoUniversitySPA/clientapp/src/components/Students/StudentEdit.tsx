import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Redirect, withRouter } from "react-router";
import { Spinner } from 'reactstrap';
import authService from "../../services/auth.service.instance";

export interface IStudentEditProps extends RouteComponentProps<any> {

}

export interface IStudentEditState {
    studentId?: number;
    studentFirstName?: string;
    studentLastName?: string;
    studentEnrollmentDate?: string;
    success: boolean;
    loading: boolean;
}

class StudentEdit extends React.Component<IStudentEditProps, IStudentEditState> {
    static displayName = StudentEdit.name;

    constructor(props: IStudentEditProps) {
        super(props);
        
        this.state = {
            studentId: props.match.params.studentID,
            success: false,
            loading: true
        };
    }
    
    public componentDidMount(): void {
        this.loadData();
    }

    public render(): React.ReactElement {
        if (this.state.success) {
            return <Redirect to="/students" />;
        }

        let contents = <Spinner type="grow" color="primary" />;

        if (!this.state.loading)
        {
            contents = <React.Fragment>
                <h4>Student</h4>
                <hr />
                <div className="row">
                    <div className="col-md-4">
                        <form onSubmit={async (event) => await this.handleSubmit(event)}>
                            <div className="form-group">
                                <label htmlFor="studentID" className="control-label">Number</label>
                                <div>{this.state.studentId}</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="title" className="control-label">Last Name</label>
                                <input name="title" type="text" required className="form-control" value={this.state.studentLastName} onChange={(event) => { this.setState({ studentLastName: event.target.value }) }} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="credits" className="control-label">First Name</label>
                                <input asp-for="credits" type="text" required className="form-control" value={this.state.studentFirstName} onChange={(event) => { this.setState({ studentFirstName: event.target.value }) }} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="credits" className="control-label">Enrollment Date</label>
                                <input asp-for="credits" type="datetime-local" required className="form-control" value={this.state.studentEnrollmentDate} onChange={(event) => { this.setState({ studentEnrollmentDate: event.target.value }) }} />
                            </div>
                            <div className="form-group">
                                <input type="submit" value="Save" className="btn btn-primary" />
                            </div>
                        </form>
                    </div>
                </div>
                <div>
                    <Link to={`/students`}>Back to List</Link>
                </div>
            </React.Fragment>;
        }

        return (
            <React.Fragment>
                <h2>Edit</h2>
                {contents}
            </React.Fragment>
        );
    }

    private async handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        await authService.getInstance().fetch(`api/students/${this.state.studentId}`, {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: this.state.studentId, firstName: this.state.studentFirstName, lastName: this.state.studentLastName, enrollmentDate: this.state.studentEnrollmentDate })
                    });

        this.setState({
            success: true,
            loading: false,
            studentId: undefined,
            studentFirstName: undefined,
            studentLastName: undefined,
            studentEnrollmentDate: undefined
        });
    }

    private async loadData(): Promise<void> {
        const response = await authService.getInstance().fetch(`api/students/${this.state.studentId}`);
        const data = await response.json();

        this.setState({
            studentFirstName: data.firstName,
            studentLastName: data.lastName,
            studentEnrollmentDate: data.enrollmentDate,
            loading: false
        });
      }
}

export default withRouter(StudentEdit);