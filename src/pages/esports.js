import React from 'react'
import styled from 'styled-components'
import background from '../images/projects/esports-1.png'
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

const eSports = () => (
    <Layout>
        <Favicon url={require('../images/favicon.png')} />
        <section id="section-title">
            <Background />
            <div className="title">
                <h1>Predicting Emerging eSport Celebrities</h1>
                <h2>Krannert eSport Hackathon</h2>
            </div>
            <div className="mask"></div>
        </section>

        <section id="content-body">
            <div className="wrapper">
                <h2>The Challenge</h2>
                <p>eSports is a relatively new market valued at $1 billion, with room for expansion and innovation. The goal of this hackathon was to solve problems for fan experience, eSport analytics, eAthlete training and performance, and sponsor insights.</p>
                <center>
                    <img src={require('../images/projects/esports-2.png')} alt="eSports stadium" />
                </center>
            </div>
            <div className="wrapper">
                <center>
                    <img src={require('../images/projects/esports-3.png')} alt="eSports industry" />
                </center>
            </div>
            <div className="wrapper">
                <h2>Our Solution</h2>
                <p>We won <a href="https://twitter.com/MatthewALanham/status/1061451997822509056" target="_blank" rel="noopener noreferrer">3rd place</a> by building a tool that scrapes Twitch, Youtube, Twitter, Instagram, and tournament audio feeds to predict emerging viral eSport athletes using IBM Watson sentiment analysis.</p>
                <center>
                    <img src={require('../images/projects/esports-4.png')} alt="" />
                </center>
            </div>
        </section>
    </Layout>
)

export default eSports
