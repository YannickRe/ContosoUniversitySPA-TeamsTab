import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Course } from '../../models/Course';
import { withRouter } from "react-router";
import { Spinner } from 'reactstrap';
import authService from "../../services/auth.service.instance";
import { AppContext } from '../AppContext';
import * as microsoftTeams from "@microsoft/teams-js";

export interface ICourseDetailProps extends RouteComponentProps<any> {

}

export interface ICourseDetailState {
    course: Course | null;
    loading: boolean;
}

class CourseDetail extends React.Component<ICourseDetailProps, ICourseDetailState> {
    static displayName = CourseDetail.name;

    constructor(props: ICourseDetailProps) {
        super(props);

        this.state = { 
            course: null, 
            loading: true
        };
    }

    public componentDidMount(): void {
        this.loadCourse();

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
                            <a href="#" onClick={(event) => { this.copyLink(event); }}>Copy link</a> |{' '} 
                            <a href="#" onClick={(event) => { this.scheduleMeeting(event); }}>Schedule meeting</a> |{' '}
                            <a href="#" onClick={(event) => { this.startChat(event); }}>Start group chat</a> |{' '}
                            <a href="#" onClick={(event) => { this.openTeamsChat(event); }}>Open Teams chat</a>
                        </div>
                </React.Fragment>;
            }

            contents = <React.Fragment>
                <div>
                    <h4>Course</h4>
                    <hr />
                    <dl className="row">
                        <dt className="col-sm-2">
                            Number
                        </dt>
                        <dd className="col-sm-10">
                            {this.state.course?.courseID}
                        </dd>
                        <dt className="col-sm-2">
                            Title
                        </dt>
                        <dd className="col-sm-10">
                        {this.state.course?.title}
                        </dd>
                        <dt className="col-sm-2">
                            Credits
                        </dt>
                        <dd className="col-sm-10">
                        {this.state.course?.credits}
                        </dd>
                        <dt className="col-sm-2">
                            Department
                        </dt>
                        <dd className="col-sm-10">
                        {this.state.course?.departmentName}
                        </dd>
                    </dl>
                </div>
                <div>
                    {/* <Link to={`/courses/edit/${this.state.course?.courseID}`}>Edit</Link> | <Link to={`/courses/delete/${this.state.course?.courseID}`}>Delete</Link> | <Link to={`/courses`}>Back to List</Link> */}
                    <Link to={`/courses/delete/${this.state.course?.courseID}`}>Delete</Link> | <Link to={`/courses`}>Back to List</Link>
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
        microsoftTeams.shareDeepLink({ subEntityId: `/courses/details/${this.state.course?.courseID}`, subEntityLabel: `Course: ${this.state.course?.title}`, subEntityWebUrl: `http://4x10.azurewebsites.net/courses/details/1050` });
    }

    private scheduleMeeting(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void {
        event.preventDefault();
        var topicName = encodeURI(`Discussion for Course: ${this.state.course?.courseID}`);
        var message = encodeURI(`I feel like we need to have a talk about course: ${this.state.course?.courseID}`);
        microsoftTeams.executeDeepLink(`https://teams.microsoft.com/l/meeting/new?attendees=jelle@yrkmsn.onmicrosoft.com,dutch.user@yrkmsn.onmicrosoft.com&subject=${topicName}&content=${message}`);
    }

    private startChat(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void {
        event.preventDefault();
        var topicName = encodeURI(`Discussion for Course: ${this.state.course?.courseID}`);
        var message = encodeURI(`I feel like we need to have a talk about course: ${this.state.course?.courseID}`);
        microsoftTeams.executeDeepLink(`https://teams.microsoft.com/l/chat/0/0?users=jelle@yrkmsn.onmicrosoft.com,dutch.user@yrkmsn.onmicrosoft.com&topicName=${topicName}&message=${message}`);
    }

    private openTeamsChat(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void {
        event.preventDefault();
        microsoftTeams.executeDeepLink("https://teams.microsoft.com/l/channel/19%3a6c2533a7b6254b6886a2e08d86eddc17%40thread.tacv2/General?groupId=fe6ebd09-1908-4b5f-aaef-7c96e9ab7e9b&tenantId=22e80a38-0d9e-4d45-a92c-356004a48f3f");
    }

    private async loadCourse(): Promise<void> {
        const response = await authService.getInstance().fetch(`api/courses/${this.props.match.params.courseID}`);
        const data = await response.json();
        this.setState({ 
            course: data, 
            loading: false 
        });
      }
}

CourseDetail.contextType = AppContext;

export default withRouter(CourseDetail);