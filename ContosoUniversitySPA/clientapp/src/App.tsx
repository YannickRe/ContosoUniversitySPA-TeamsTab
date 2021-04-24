import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout/Layout';
import './custom.css'
import { Courses } from './components/Courses/Courses';
import CourseDetail from './components/Courses/CourseDetail';

export default class App extends Component {
    static displayName = App.name;

    public render(): React.ReactElement {
        return (
            <Layout>
                <Route exact path='/' component={Courses} />
                <Route exact path='/courses' component={Courses} />
                <Route path="/courses/details/:courseID" component={CourseDetail} />
            </Layout>
        );
    }
}