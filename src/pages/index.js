import React from 'react'
import Card from '../components/card';
import Section from '../components/section';
import Wave from '../components/wave';
import staticdata from '../../staticdata.json'
import Post from '../components/post';
import { withPrefix } from 'gatsby'
import Favicon from 'react-favicon';
import Layout from '../components/layout';

const IndexPage = () => (
  <Layout>
    <Favicon url={require('../images/favicon.png')} />
    <div className="Hero">
      <div className="HeroGroup">
        <h1>Nikhil D'Souza</h1>
        <p>I'm passionate about building innovative projects with AI and technology.</p>
        <div className="Logos">
          <img src={require('../images/logo-ml.png')} width="50" alt="Machine learning" />
          <img src={require('../images/logo-keras.png')} width="50" alt="Keras" />
          <img src={require('../images/logo-python.png')} width="50" alt="Python" />
          <img src={require('../images/logo-swift.png')} width="50" alt="Swift" />
          <img src={require('../images/logo-react.png')} width="50" alt="React" />
          <img src={require('../images/logo-sketch.png')} width="50" alt="Sketch" />
        </div>
        <Wave />
      </div>
    </div>

    <div className="About">
      <div className="AboutImage"></div>
      <div className="AboutText">
        <h2>About Me</h2>
        <p>
          I have an avid interest in machine learning and software engineering. I enjoy coding, designing, attending hackathons, and playing with new tech. Currently, I'm working with <a href="https://www.vincere.health/" target="_blank" rel="noopener noreferrer">Vincere Health</a>, an early-stage startup out of Harvard Innovation Labs. Last year, I won 2nd place at the <a href="https://blog.nikhiljay.com/pennapps-3a0e4a4f9d60" target="_blank" rel="noopener noreferrer">world's largest college hackathon</a>. <br /><br /> Check out my <a href="https://github.com/nikhiljay" target="_blank" rel="noopener noreferrer">Github</a> and <a href={withPrefix('/docs/nikhil-resume.pdf')} target="_blank" rel="noopener noreferrer">resume</a>.
        </p>
      </div>
    </div>

    <div className="Cards">
      <h2>My projects</h2>
      <div className="CardGroup">
        {staticdata.projects.map((project, i) => (
          <Card
            title={project.title}
            text={project.text}
            image={project.image}
            link={project.link}
            light={project.light}
            key={i}
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
  </Layout>
)

export default IndexPage
