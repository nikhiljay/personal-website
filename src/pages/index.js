import React from 'react'
import Link from 'gatsby-link'
import Card from '../components/Card';
import Section from '../components/Section';
import styled from 'styled-components'
import Wave from '../components/Wave';
import staticdata from '../../staticdata.json'
import Cell from '../components/Cell';
import Post from '../components/Post';
import resume from '../docs/resume.pdf'

const SectionCaption = styled.p`
  font-weight: 600;
  font-size: 18px;
  text-transform: uppercase;
  color: #94A4BA;
  text-align: center;
`

const SectionCellGroup = styled.div`
  max-width: 800px;
  margin: 0 auto 100px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 20px;
  padding: 0 20px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(1, 1fr);
  }
`

const SectionBlogGroup = styled.div`
  max-width: 1000px;
  margin: 0 auto 100px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 40px;

  @media (max-width: 1060px) {
    max-width: 640px;
    grid-template-columns: repeat(2, 1fr);
}

  @media (max-width: 720px) {
    grid-template-columns: repeat(1, 1fr);
  }
`

const IndexPage = () => (
  <div>
    <div className="Hero">
      <div className="HeroGroup">
        <h1>Nikhil D'Souza</h1>
        <p>I’m a student @ Purdue aspiring to apply technology and AI to the health industry.</p>
        <div className="Logos">
          <img src={require('../images/logo-sketch.png')} width="50" />
          <img src={require('../images/logo-figma.png')} width="50" />
          <img src={require('../images/logo-studio.png')} width="50" />
          <img src={require('../images/logo-framer.png')} width="50" />
          <img src={require('../images/logo-react.png')} width="50" />
          <img src={require('../images/logo-swift.png')} width="50" />
        </div>
        <Wave />
      </div>
    </div>

    <div className="About">
      <div className="AboutImage"></div>
      <div className="AboutText">
        <h2>About Me</h2>
        <p>
          I have an avid interest in machine learning and digital health. I enjoy coding, designing, and playing with new technologies. Last year, I had a lot of fun organizing my high school's official student-run <a href="https://gunnhacks.com/" target="_blank">hackathon</a>. This summer, I'm a software engineering intern in the innovation lab at <a href="https://www.saama.com/" target="_blank">Saama</a>. <br /><br /> Check out my <a href="https://github.com/nikhiljay" target="_blank">Github</a> and <a href={resume} target="_blank">resume</a>.
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

    <div className="SectionGroup">
      <div className="SectionTitleGroup">
        <h3>AI enthusiast.</h3>
        <h3>Eagle Scout.</h3>
        <h3>Apple WWDC Scholarship Winner.</h3>
      </div>
    </div>

    <div className="Blog">
      <h2>My blog</h2>
      <p>Dive deeper into my corner of the internet.</p>
      <SectionBlogGroup>
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
      </SectionBlogGroup>
    </div>
    {/* <SectionCaption>12 sections - 6 hours</SectionCaption>
    <SectionCellGroup>
      {staticdata.cells.map(cell => (
        <Cell
          title={cell.title}
          image={cell.image}
        />
      ))}
    </SectionCellGroup> */}
  </div>
)

export default IndexPage
