import React from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Table } from 'reactstrap';
import { Course } from '../../models/Course';
import authService from "../../services/auth.service.instance";

export interface ICoursesProps {

}

export interface ICoursesState {
    courses: Course[];
    loading: boolean;
}

export class Courses extends React.Component<ICoursesProps, ICoursesState> {
    static displayName = Courses.name;

    constructor(props: ICoursesProps) {
        super(props);

        this.state = { 
            courses: [], 
            loading: true 
        };
    }

    public componentDidMount(): void {
        this.loadCourses();
    }

    public static renderTable(courses: Course[]): React.ReactElement {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Number</th>
                        <th>Title</th>
                        <th>Credits</th>
                        <th>Department</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course =>
                        <tr key={course.courseID}>
                            <th scope="row">{course.courseID}</th>
                            <td>{course.title}</td>
                            <td>{course.credits}</td>
                            <td>{course.departmentName}</td>
                            <td><Link to={`/courses/details/${course.courseID}`}>Details</Link> | <Link to={`/courses/delete/${course.courseID}`}>Delete</Link></td>
                            {/* <td><Link to={`/courses/edit/${course.courseID}`}>Edit</Link> | <Link to={`/courses/details/${course.courseID}`}>Details</Link> | <Link to={`/courses/delete/${course.courseID}`}>Delete</Link></td> */}
                        </tr>
                    )}
                </tbody>
            </Table>
        );
      }

    public render(): React.ReactElement<ICoursesProps> {
        let contents = this.state.loading ? <Spinner type="grow" color="primary" /> : Courses.renderTable(this.state.courses);
        return (
            <React.Fragment>
                <h1>Courses</h1>
                <p>
                    <Link to={`/courses/create`}>Create New</Link>
                </p>
                {contents}
            </React.Fragment>
        );
    }

    private async loadCourses(): Promise<void> {
        const response = await authService.getInstance().fetch('api/courses');
        const data = await response.json();
        this.setState({ 
            courses: data, 
            loading: false 
        });
    }
}
