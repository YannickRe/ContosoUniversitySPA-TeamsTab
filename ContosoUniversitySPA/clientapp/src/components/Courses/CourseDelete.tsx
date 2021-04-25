import React from 'react';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import { Course } from '../../models/Course';
import { withRouter } from "react-router";
import { Spinner } from 'reactstrap';
import authService from "../../services/auth.service.instance";

export interface ICourseDeleteProps extends RouteComponentProps<any> {

}

export interface ICourseDeleteState {
    course: Course | null;
    loading: boolean;
    success: boolean;
}

class CourseDelete extends React.Component<ICourseDeleteProps, ICourseDeleteState> {
    static displayName = CourseDelete.name;

    constructor(props: ICourseDeleteProps) {
        super(props);

        this.state = { 
            course: null, 
            loading: true,
            success: false
        };
    }

    public componentDidMount(): void {
        this.loadCourse();
    }

    public render(): React.ReactElement {
        if (this.state.success) {
            return <Redirect to="/courses" />;
        }

        let contents = <Spinner type="grow" color="primary" />;

        if (!this.state.loading) {
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
                    <input type="button" value="Delete" className="btn btn-danger" onClick={async (event) => { await this.handleDelete(event); }} /> | <Link to={`/courses`}>Back to List</Link>
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
        
        await authService.getInstance().fetch(`api/courses/${this.state.course?.courseID}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        }
                                    });

        this.setState({
            success: true,
            loading: false,
            course: null
        });
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

export default withRouter(CourseDelete);