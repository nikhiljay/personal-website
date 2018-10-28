import React from 'react'
import Card from '../components/Card';
import Section from '../components/Section';
import Wave from '../components/Wave';
import staticdata from '../../staticdata.json'
import Post from '../components/Post';
import resume from '../docs/resume.pdf'
import Favicon from 'react-favicon';

const IndexPage = () => (
  <div>
    <Favicon url={require('../images/favicon.png')} />
    <div className="Hero">
      <div className="HeroGroup">
        <h1>Nikhil D'Souza</h1>
        <p>I'm passionate about building innovative projects with AI and technology.</p>
        <div className="Logos">
          <img src={require('../images/logo-ml.png')} width="50" />
          <img src={require('../images/logo-keras.png')} width="50" />
          <img src={require('../images/logo-python.png')} width="50" />
          <img src={require('../images/logo-swift.png')} width="50" />
          <img src={require('../images/logo-react.png')} width="50" />
          <img src={require('../images/logo-sketch.png')} width="50" />
        </div>
        <Wave />
      </div>
    </div>

    <div className="About">
      <div className="AboutImage"></div>
      <div className="AboutText">
        <h2>About Me</h2>
        <p>
          I have an avid interest in machine learning and digital health. I enjoy coding, designing, attending hackathons, and playing with new technology. Currently, I'm working with <a href="https://www.viasat.com" target="_blank">Viasat</a> as data science intern. Recently, I won 2nd place at the <a href="https://blog.nikhiljay.com/pennapps-3a0e4a4f9d60" target="_blank">world's largest college hackathon</a>. <br /><br /> Check out my <a href="https://github.com/nikhiljay" target="_blank">Github</a> and <a href={resume} target="_blank">resume</a>.
        </p>
      </div>
    </div>

    <div className="Cards">
      <h2>My projects</h2>
      <div className="CardGroup">
        {staticdata.projects.map(project => (
          <Card
            title={project.title}
            text={project.text}
            image={project.image}
            link={project.link}
            light={project.light}
          />
        ))}
      </div>
    </div>

    <Section />

    <div className="Blog">
      <h2>My blog</h2>
      <p>Dive deeper into my corner of the internet.</p>
      <div className="BlogGroup">
        <Post
          title="Transfer Learning"
          image="https://cdn-images-1.medium.com/max/1600/1*yw1zbqvxvxR4tNxgKhvr3A.png"
          link="https://blog.nikhiljay.com/transfer-learning-69ca80d5a621"
          date="Jun 7"
        />
        <Post
          title="ML Update: Keras and CoreML"
          image="https://cdn-images-1.medium.com/max/1600/1*U9GQMFsXAeEwQylryh16dQ.png"
          link="https://blog.nikhiljay.com/ml-update-39e68572ecc5"
          date="May 23"
        />
        <Post
          title="My Journey into Machine Learning"
          image="https://cdn-images-1.medium.com/max/1600/1*z32UVDAY_vHuGWy-EXeN_g.jpeg"
          link="https://blog.nikhiljay.com/my-journey-into-machine-learning-44587a96289f"
          date="Nov 20"
        />
      </div>
    </div>
  </div>
)

export default IndexPage
