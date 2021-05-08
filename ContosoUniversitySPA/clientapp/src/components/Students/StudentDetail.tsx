import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Student } from '../../models/Student';
import { withRouter } from "react-router";
import { Button, Spinner } from 'reactstrap';
import authService from "../../services/auth.service.instance";
import { AppContext } from '../AppContext';
import * as microsoftTeams from "@microsoft/teams-js";

export interface IStudentDetailProps extends RouteComponentProps<any> {

}

export interface IStudentDetailState {
    student: Student | null;
    loading: boolean;
}

class StudentDetail extends React.Component<IStudentDetailProps, IStudentDetailState> {
    static displayName = StudentDetail.name;

    constructor(props: IStudentDetailProps) {
        super(props);

        this.state = { 
            student: null, 
            loading: true
        };
    }

    public componentDidMount(): void {
        this.loadStudent();

        if (this.context.inTeams) {
            microsoftTeams.initialize();
        }
    }

    public render(): React.ReactElement {
        let contents = <Spinner type="grow" color="primary" />;
        let teamsContent = null;

        if (!this.state.loading) {
            if (this.context.inTeams) {
                let teamsStyle = {
                    marginTop: "35px"
                }
                teamsContent = <React.Fragment>
                    <div style={teamsStyle}>
                        <h4>Microsoft Teams Actions</h4>
                        <hr />
                    </div>
                    <div>
                        <Button color="link" onClick={(event) => { this.copyLink(event); }}>Copy link</Button>
                    </div>
                </React.Fragment>;
            }

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
                    <Link to={`/students/edit/${this.state.student?.id}`}>Edit</Link> | <Link to={`/students/delete/${this.state.student?.id}`}>Delete</Link> | <Link to={`/students`}>Back to List</Link>
                </div>

                {teamsContent}
            </React.Fragment>
        }


        return (
            <React.Fragment>
                <h2>Details</h2>
                {contents}
            </React.Fragment>
        );
    }

    private copyLink(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void {
        event.preventDefault();
        microsoftTeams.shareDeepLink({ subEntityId: `/students/details/${this.state.student?.id}`, subEntityLabel: `Student: ${this.state.student?.lastName} ${this.state.student?.firstName}`, subEntityWebUrl: `${window.location.origin}/students/details/${this.state.student?.id}` });
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

StudentDetail.contextType = AppContext;

export default withRouter(StudentDetail);