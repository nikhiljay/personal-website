import React from 'react'
import styled from 'styled-components'
import Favicon from 'react-favicon';
import Layout from '../components/layout'

const Background = styled.div`
    width: 100%;
    height: 100%;
    background-image: url(http://wondrlust.com/wp-content/uploads/2017/11/o-STUDENTS-VOLUNTEERING-facebook.jpg);
    background-size: cover;
    background-position: center;
    position: absolute;
`

const Wolly = () => (
    <Layout>
        <Favicon url={require('../images/favicon.png')} />
        <section id="section-title">
            <Background />
            <div className="title">
                <h1>Wolly</h1>
                <h2>Redefining volunteering.</h2>
            </div>
            <div className="mask"></div>
        </section>

        <section id="content-body">
            <div className="wrapper">
                <h2>A Volunteering App</h2>
                <p>Most high schools require their students to complete a certain amount of service hours. However, most students don't really enjoy doing service hours for things that they don't like such as "babysitting" or something. Our app gives the user a list of volunteering opportunities that are relevant to the user. If they specialize in technology, then they could choose a tech support for example. People could also request for volunteers if they are hosting an event.</p>
                <center><img src={require('../images/projects/wolly.jpg')} /></center>
            </div>
            <div className="wrapper">
                <p>Want learn more about this app? You can check it out right now on <a href="https://devpost.com/software/nikhil-d-souza" target="_blank">Devpost</a>.</p>
            </div>
        </section>
    </Layout>
)

export default Wolly
