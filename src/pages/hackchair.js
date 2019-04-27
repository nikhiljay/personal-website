import React from 'react'
import styled from 'styled-components'
import Favicon from 'react-favicon';
import Layout from '../components/layout'

const Background = styled.div`
    width: 100%;
    height: 100%;
    background-image: url(https://cdn-images-1.medium.com/max/1600/1*mo00W8aSQ9VumqFdCu8MUw.jpeg);
    background-size: cover;
    background-position: center;
    position: absolute;
`

const HackChair = () => (
    <Layout>
        <Favicon url={require('../images/favicon.png')} />
        <section id="section-title">
            <Background />
            <div className="title">
                <h1>Hack Chair</h1>
                <h2>HackingEDU Hackathon</h2>
            </div>
            <div className="mask"></div>
        </section>

        <section id="content-body">
            <div className="wrapper">
                <p>Hackathons are like playgrounds, where people collaborate to make something new and where creativity is fostered. Before organizing Gunn Hacks, my friends and I participated in many hackathons, one of them being HackingEDU where we beat 205 other teams many of which were made up of college students. We noticed that students like us spend a large portion of our lives just sitting in chairs, and we learned that of the 7,000 schoolchildren admitted to the hospital in the UK each year due to chair-related accidents, 70% were rocking back dangerously.</p>
            </div>
            <div className="wrapper">
                <p>We wanted to come up with a hack that would be so versatile that the majority of the materials could be accessed by an average person. We hacked a chair. We used an ordinary plastic chair, cardboard, duct tape, an iPhone, a muse headband, and empty nacho boxes.</p>
            </div>
            <div className="wrapper">
                <h2>Features</h2>
                <p>First, the Hack Chair uses the iPhone's gyroscope to detect how far back a chair is titled. The iPhone is attached to the back of the chair and is useful to determine the safety off student. The muse brain-sensing headband is used to check how sleepy a student is based on their eye movements and how the chair is positioned. When a person leans back too far or falls asleep, the chair vibrates.</p>
                <center><img src={require('../images/projects/hackchair-1.jpg')} alt="Hack chair demo" /></center>
                <p>The Hack Chair uses the camera as a proximity sensor on the iPhone to detect how good a student's posture is. When a student is slouching, the distance between the chair and the proximity sensor is increased and the Hack Chair is capable of detecting the situation as bad posture. The Hack Chair will constantly remind the user to have a good posture using a series of vibrations. This can prevent medical problems such as scoliosis.</p>
            </div>
            <div className="wrapper">
                <h2>Conclusion</h2>
                <p>At the end, we wrapped together the whole project into a Javascript Library called “hackchair.js” so that anyone could use our technology with any chair. See the hackathon project submission on <a href="https://devpost.com/software/hack-chair">Devpost</a>. This project is open-source! Check out the repository on <a href="https://github.com/kvfrans/HackChair">Github</a>.</p>
                <center><img src={require('../images/projects/hackchair-2.jpg')} alt="HackingEDU awards ceremony" /></center>
            </div>
        </section>
    </Layout>
)

export default HackChair
