import React from 'react'
import styled from 'styled-components'
import background from '../images/projects/prioritize.jpg'
import Favicon from 'react-favicon';
import Layout from '../components/layout'

const Background = styled.div`
    width: 100%;
    height: 100%;
    background-image: url(${background});
    background-size: cover;
    background-position: center;
    position: absolute;
`

const Prioritize = () => (
    <Layout>
        <Favicon url={require('../images/favicon.png')} />
        <section id="section-title">
            <Background />
            <div className="title">
                <h1>Prioritize</h1>
                <h2>A utility to organize tasks.</h2>
            </div>
            <div className="mask"></div>
        </section>

        <section id="content-body">
            <div className="wrapper">
                <h2>Smart Task Manager</h2>
                <p>Prioritize analyzes real time factors and organizes tasks based on which is most convenient and essential. Based on when the stores are open, Prioritize will order things you need to do based on when they can be done. The tasks involving places that close first are put as priority. Prioritize will also organize your tasks based on which is closest to you, eliminating traveling time from one place to another.</p>
            </div>
            <div className="wrapper">
                <h2>Efficient</h2>
                <p>Prioritize makes your life better by giving you more time to do what you want. Prioritize values efficiency, saving you time by organizing the tasks that need to be done in such a way that will limit required preparation and ensure the completion of tasks by verifying store hours. You can access your tasks across all devices, using a web-based system that allows you to view your tasks anywhere.</p>
            </div>
        </section>
    </Layout>
)

export default Prioritize
