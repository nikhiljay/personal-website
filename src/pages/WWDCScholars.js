import React from 'react'
import styled from 'styled-components'

const Background = styled.div`
    width: 100%;
    height: 100%;
    background-image: url(https://cdn-images-1.medium.com/max/2000/1*YXOjQ06e8KzUK5CTh1cmQw.jpeg);
    background-size: cover;
    background-position: center;
    position: absolute;
`

const WWDCScholars = () => (
    <div>
        <section id="section-title">
            <Background />
            <div className="title">
                <h1>WWDC Scholars</h1>
                <h2>WWDC Scholarship Winners.</h2>
            </div>
            <div className="mask"></div>
        </section>

        <section id="content-body">
            <div className="wrapper">
                <p>If you do not know about the <a href="https://developer.apple.com/wwdc/scholarships/" target="_blank">WWDC Scholarship</a>, you can check out <a href="https://blog.nikhiljay.com/winning-the-wwdc-scholarship-2693b8daf17d" target="_blank">this post</a> on my blog.</p>
            </div>
            <div className="wrapper">
                <h2>Scholars</h2>
                <p>One of the awesome things about being a scholar is meet many other scholars with similar interests. In fact, we have already started a group of 200 scholars. We talk about interesting topics, ask questions, share our ideas, help each other, and get to know each other more. But that wasn’t enough for us. We decided to create an app and a website. We wanted to do this because we wanted to show everyone the talent that every WWDC Scholar has. For the past couple weeks a group of 16 people, each in a different time zone, have worked so hard to make this possible. We’re scholars from all around the world and we combined our knowledge, our innovation and our love for software to build this app to inspire kids, students, and future iOS developers to build apps that can change the world.</p>
                <center><img alt="iPhone App" src={require('../images/projects/scholars-1.jpg')} /></center>
            </div>
            <div className="wrapper">
                <h2>The App</h2>
                <p>What does this app do? Well, it contains us, WWDC scholarship winners, our works and how you can connect with us. With this app, we are able to showcase our talents and inspire future generation to build things, to make a difference and to change the world. We are the crazy ones, the misfits, the rebels, and the ones who see things differently. We are the epicenter of change. We are the WWDC student scholarship winners of 2015.</p>
                <center><img alt="Apple Watch App" src={require('../images/projects/scholars-2.jpg')} /></center>
            </div>
            <div className="wrapper">
                <h2>Learn More</h2>
                <p>This app is available for iPhone, iPad, and Apple Watch. You can check it out right now on the <a href="https://itunes.apple.com/us/app/scholars-of-wwdc/id999731893?mt=8" target="_blank">App Store</a>. Comment and rate if you are interested! You can also check out the website right now at <a href="https://wwdcscholars.com" target="_blank">wwdcscholars.com</a>.</p>
            </div>
        </section>
    </div>
)

export default WWDCScholars
