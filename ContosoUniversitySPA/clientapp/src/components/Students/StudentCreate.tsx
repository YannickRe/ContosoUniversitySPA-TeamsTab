import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Redirect, withRouter } from "react-router";
import authService from "../../services/auth.service.instance";

export interface IStudentCreateProps extends RouteComponentProps<any> {

}

export interface IStudentCreateState {
    studentLastName?: string;
    studentFirstName?: string;
    studentEnrollmentDate?: string;
    success: boolean;
}

class StudentCreate extends React.Component<IStudentCreateProps, IStudentCreateState> {
    static displayName = StudentCreate.name;

    constructor(props: IStudentCreateProps) {
        super(props);

        this.state = { 
            success: false
        };
    }

    public render(): React.ReactElement {
        if (this.state.success) {
            return <Redirect to="/students" />;
        }

        let contents = <React.Fragment>
                <h4>Student</h4>
                <hr />
                <div className="row">
                    <div className="col-md-4">
                        <form onSubmit={async (event) => await this.handleSubmit(event)}>
                            <div className="form-group">
                                <label htmlFor="studentID" className="control-label">Last Name</label>
                                <input name="studentID" type="text" required className="form-control" value={this.state.studentLastName} onChange={(event) => { this.setState({ studentLastName: event.target.value }) }} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="title" className="control-label">First Name</label>
                                <input name="title" type="text" className="form-control" required value={this.state.studentFirstName} onChange={(event) => { this.setState({ studentFirstName: event.target.value }) }} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="credits" className="control-label">Enrollment Date</label>
                                <input asp-for="credits" type="datetime-local" required className="form-control" value={this.state.studentEnrollmentDate} onChange={(event) => { this.setState({ studentEnrollmentDate: event.target.value }) }} />
                            </div>
                            <div className="form-group">
                                <input type="submit" value="Create" className="btn btn-primary" />
                            </div>
                        </form>
                    </div>
                </div>
                <div>
                    <Link to={`/students`}>Back to List</Link>
                </div>
            </React.Fragment>;

        return (
            <React.Fragment>
                <h2>Create</h2>
                {contents}
            </React.Fragment>
        );
    }

    private async handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        const rawResponse = await authService.getInstance().fetch(`api/students`, {
                                        method: 'POST',
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ firstName: this.state.studentFirstName, lastName: this.state.studentLastName, enrollmentDate: this.state.studentEnrollmentDate })
                                    });
        await rawResponse.json();

        this.setState({
            success: true,
            studentFirstName: undefined,
            studentLastName: undefined,
            studentEnrollmentDate: undefined,
        });
    }
}

export default withRouter(StudentCreate);