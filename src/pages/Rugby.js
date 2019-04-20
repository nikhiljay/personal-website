import React from 'react'
import styled from 'styled-components'
import background from '../images/projects/rugby.jpg'
import Favicon from 'react-favicon';

const Background = styled.div`
    width: 100%;
    height: 100%;
    background-image: url(${background});
    background-size: cover;
    background-position: center;
    position: absolute;
`

const Rugby = () => (
    <div>
        <Favicon url={require('../images/favicon.png')} />
        <section id="section-title">
            <Background />
            <div className="title">
                <h1>Calculating Fatigue of Rugby Athletes</h1>
                <h2>ASA DataFest 2019</h2>
            </div>
            <div className="mask"></div>
        </section>

        <section id="content-body">
            <div className="wrapper">
                <h2>The Game</h2>
                <p>Rugby 7s is a fast-paced, physically demanding sport that pushes the limits of athlete speed, endurance and toughness. Rugby 7s players may play in up to three games in a day, resulting in a tremendous amount of athletic exertion. Substantial exertion results in fatigue, which may lead to physiological deficits (e.g., dehydration), reduced athletic performance, and greater risk of injury.</p>
            </div>
            <div className="wrapper">
                <h2>The Challenge</h2>
                <p>Despite the importance of managing player fatigue in professional athletics, very little is known about its effects, and many training decisions are based on “gut feel.”Currently, training load is measured through a combination of subjective measurements (asking players how hard they worked) and objective measurements from wearable technology. Fatigue is typically estimated by asking players how they feel in wellness surveys. However, there is no agreed-upon standard of defining fatigue so the relationship between workload and fatigue is unclear.</p>
            </div>
            <div className="wrapper">
                <h2>Our Solution</h2>
                <p>We won <a href="http://llc.stat.purdue.edu/datafest2019.html" target="_blank">1st place</a> by building a tool that determines real-time fatigue levels of rugby players by identifying impacts, measuring sprint distance, and analyzing health metrics. This allows for real-time calculations of fatigue of the athletes, which is more useful than wellness surveys.</p>
                <center>
                    <iframe src="https://docs.google.com/presentation/d/e/2PACX-1vRSJFHCzxc1je_SQ-t-PyP81Gzjy8o0OF9iztqBqiaP3E2wb_uyKlyYuWSJLzi664KC-E7IlP-IFZw3/embed?start=true&loop=true&delayms=5000" frameborder="0" width="85.7%" height="367" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
                </center>
            </div>
        </section>
    </div>
)

export default Rugby
