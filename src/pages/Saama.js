import React from 'react'
import styled from 'styled-components'
import background from '../images/projects/saama.png'
import Favicon from 'react-favicon';

const Background = styled.div`
    width: 100%;
    height: 100%;
    background-image: url(${background});
    background-size: cover;
    background-position: center;
    position: absolute;
`

const Prioritize = () => (
    <div>
        <Favicon url={require('../images/favicon.png')} />
        <section id="section-title">
            <Background />
            <div className="title">
                <h1>Saama</h1>
                <h2>Using ML to identify packaging anomalies.</h2>
            </div>
            <div className="mask"></div>
        </section>

        <section id="content-body">
            <div className="wrapper">
                <h2>My experience</h2>
                <p>I recently partnered with the innovation lab of one of the largest biotech companies with the objective of using machine learning techniques to identify packaging anomalies on a conveyor belt. I've had to be very creative to improve the accuracy of my machine learning model. For example, I was only given a small dataset of 200 images, but I used image augmentation to expand my dataset to several thousand images by flipping, rotating, and translating images. I also had to be careful of the size of my model because it had to run in less than 100 milliseconds.</p>
            </div>
            <div className="wrapper">
                <p>By the end of my internship, I successfully built a convolutional neural network with 99.7% validation accuracy.</p>
            </div>
        </section>
    </div>
)

export default Prioritize
