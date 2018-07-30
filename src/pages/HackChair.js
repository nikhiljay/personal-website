import React from 'react'
import styled from 'styled-components'

const Background = styled.div`
    width: 100%;
    height: 100%;
    background-image: url(https://cdn-images-1.medium.com/max/1600/1*mo00W8aSQ9VumqFdCu8MUw.jpeg);
    background-size: cover;
    background-position: center;
    position: absolute;
`

const HackChair = () => (
    <div>
        <section id="section-title">
            <Background />
            <div className="title">
                <h1>Hack Chair</h1>
                <h2>We hacked a chair.</h2>
            </div>
            <div className="mask"></div>
        </section>

        <section id="content-body">
            <div className="wrapper">
                <p>The Hack Chair is a creative analytical tool that is built from a chair. We used an ordinary plastic chair, cardboard, duct tape, 2 iPhones, a muse headband, and empty nacho boxes.</p>
            </div>
            <div className="wrapper">
                <h2>Tilt Prevention</h2>
                <p>First, the Hack Chair uses an iPhone's gyroscope to detect how far back a chair is titled. This is useful to determine the safety off student. Of the 7,000 schoolchildren admitted to hospital each year as a result of chair-related accidents, 70% were rocking back dangerously, according to the analysis of government statistics by a south London teacher. By measuring when the user reaches a tilting hazard, we give an immediate notification that also suggests other alternative chairs. This feature used the Target API.</p>
                <center><img src={require('../images/projects/hackchair-1.jpg')} /></center>
            </div>
            <div className="wrapper">
                <h2>Sleep Tracking</h2>
                <p>The muse brain-sensing headband on the user is used to check how sleepy a student is based on their eye movements and how the chair is positioned. Using the iPhones that we used for other features, we were able to vibrate the user if they fell asleep. This feature used the muse SDK.</p>
            </div>
            <div className="wrapper">
                <h2>Posture Detection</h2>
                <p>The Hack Chair uses the camera as a proximity sensor on the iPhone to detect how good a student's posture is when sitting on a chair. When the posture of the user is bad, Hack Chair will constantly remind the user to have a good posture. This can prevent medical problems such as scoliosis.</p>
            </div>
            <div className="wrapper">
                <h2>Academic Dishonesty Prevention</h2>
                <p>Also, the arm of the Hack Chair has a camera that allows teachers and other students to collaborate. This tool can also help prevent academic dishonesty. This feature used the Moxtra API.</p>
            </div>
            <div className="wrapper">
                <h2>Conclusion</h2>
                <p>At the end, we wrapped together the whole project into a Javascript Library called “hackchair.js” so that anyone could use our technology to find analytics of their chair. See the hackathon project submission on <a href="https://devpost.com/software/hack-chair">Devpost</a>. This project is open-source! Check out the repository on <a href="https://github.com/kvfrans/HackChair">Github</a>.</p>
                <center><img alt="We won!" src={require('../images/projects/hackchair-2.jpg')} /></center>
            </div>
        </section>
    </div>
)

export default HackChair
