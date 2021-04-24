import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Course } from '../../models/Course';
import { withRouter } from "react-router";
import { Spinner } from 'reactstrap';

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
    }

    public render(): React.ReactElement {
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
                    <Link to={`/courses/edit/${this.state.course?.courseID}`}>Edit</Link> | <Link to={`/courses`}>Back to List</Link>
                </div>
            </React.Fragment>
        }


        return (
            <React.Fragment>
                <h2>Details</h2>
                {contents}
            </React.Fragment>
        );
    }

    private async loadCourse(): Promise<void> {
        const response = await fetch(`courses/${this.props.match.params.courseID}`);
        const data = await response.json();
        this.setState({ 
            course: data, 
            loading: false 
        });
      }
}

export default withRouter(CourseDetail);