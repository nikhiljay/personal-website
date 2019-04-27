import React from 'react'
import styled from 'styled-components'
import background from '../images/projects/gunnhacks-1.jpg'
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

const GunnHacks = () => (
    <Layout>
        <Favicon url={require('../images/favicon.png')} />
        <section id="section-title">
            <Background />
            <div className="title">
                <h1>GunnHacks</h1>
                <h2>Gunn High School's annual 24-hour student hackathon.</h2>
            </div>
            <div className="mask"></div>
        </section>

        <section id="content-body">
            <div className="wrapper">
                <h2>A Student-Run Hackathon</h2>
                <p>Throughout high school, I participated in hackathons with my friends learning more and more about technology. Eventually, I attended so many hackathons, that I had enough experience to host a hackathon at my own high school. With the help of my friends, I hosted a high school hackathon with over 200 students from all over the Bay Area after months of contacting sponsors and judges, planning prizes, and designing t-shirts.</p>
                <center>
                    <img src={require('../images/projects/gunnhacks-2.jpg')} alt="" />
                    <br /><br />
                    <img src={require('../images/projects/gunnhacks-3.jpg')} alt="" />
                    <br /><br />
                    <img src={require('../images/projects/gunnhacks-4.jpg')} alt="" />
                </center>
            </div>
            <div className="wrapper">
                <p>Check out the GunnHacks website <a href="https://gunnhacks.com" target="_blank" rel="noopener noreferrer">here</a>.</p>
            </div>
        </section>
    </Layout>
)

export default GunnHacks
