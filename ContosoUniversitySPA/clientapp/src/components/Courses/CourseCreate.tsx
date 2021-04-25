import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Redirect, withRouter } from "react-router";
import { Spinner } from 'reactstrap';
import authService from "../../services/auth.service.instance";
import { Department } from '../../models/Department';

export interface ICourseCreateProps extends RouteComponentProps<any> {

}

export interface ICourseCreateState {
    departments: Department[];
    courseId?: number;
    courseTitle?: string;
    courseCredits?: number;
    courseDepartmentId: number;
    success: boolean;
    loading: boolean;
}

class CourseCreate extends React.Component<ICourseCreateProps, ICourseCreateState> {
    static displayName = CourseCreate.name;

    constructor(props: ICourseCreateProps) {
        super(props);

        this.state = { 
            departments: [],
            success: false,
            loading: true,
            courseDepartmentId: 0
        };
    }
    
    public componentDidMount(): void {
        this.loadDepartment();
    }

    public render(): React.ReactElement {
        if (this.state.success) {
            return <Redirect to="/courses" />;
        }

        let contents = <Spinner type="grow" color="primary" />;

        if (!this.state.loading)
        {
            contents = <React.Fragment>
                <h4>Course</h4>
                <hr />
                <div className="row">
                    <div className="col-md-4">
                        <form onSubmit={async (event) => await this.handleSubmit(event)}>
                            <div className="form-group">
                                <label htmlFor="courseID" className="control-label">Number</label>
                                <input name="courseID" className="form-control" value={this.state.courseId} onChange={(event) => { this.setState({ courseId: +event.target.value }) }} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="title" className="control-label">Title</label>
                                <input name="title" className="form-control" value={this.state.courseTitle} onChange={(event) => { this.setState({ courseTitle: event.target.value }) }} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="credits" className="control-label">Credits</label>
                                <input asp-for="credits" className="form-control" value={this.state.courseCredits} onChange={(event) => { this.setState({ courseCredits: +event.target.value }) }} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="departmentID" className="control-label">Department</label>
                                <select name="departmentID" className="form-control" value={this.state.courseDepartmentId} onChange={(event) => { this.setState({ courseDepartmentId: +event.target.value }) }}>
                                    <option value="">-- Select Department --</option>
                                    {this.state.departments.map(dep =>
                                        <option key={dep.departmentID} value={dep.departmentID}>{dep.name}</option>
                                    )}
                                </select>
                            </div>
                            <div className="form-group">
                                <input type="submit" value="Create" className="btn btn-primary" />
                            </div>
                        </form>
                    </div>
                </div>
                <div>
                    <Link to={`/courses`}>Back to List</Link>
                </div>
            </React.Fragment>;
        }

        return (
            <React.Fragment>
                <h2>Create</h2>
                {contents}
            </React.Fragment>
        );
    }

    private async handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        
        const rawResponse = await authService.getInstance().fetch(`api/courses`, {
                                        method: 'POST',
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({courseID: this.state.courseId, title: this.state.courseTitle, credits: this.state.courseCredits, departmentID: this.state.courseDepartmentId})
                                    });
        await rawResponse.json();

        this.setState({
            success: true,
            loading: false,
            courseId: undefined,
            courseTitle: undefined,
            courseCredits: undefined,
        });
    }

    private async loadDepartment(): Promise<void> {
        const response = await authService.getInstance().fetch(`api/departments`);
        const data = await response.json();
        this.setState({ 
            departments: data, 
            loading: false 
        });
      }
}

export default withRouter(CourseCreate);