import React from 'react'
import Link from 'gatsby-link'
import Card from '../components/Card';
import Section from '../components/Section';
import styled from 'styled-components'
import Wave from '../components/Wave';
import staticdata from '../../staticdata.json'
import Cell from '../components/Cell';

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
          I have an avid interest in machine learning and digital health. I enjoy coding, designing, and playing with new technologies. Last year, I had a lot of fun organizing my high school's official student-run <a href="https://gunnhacks.com/" target="_blank">hackathon</a>. This summer, I'm a software engineering intern in the innovation lab at <a href="https://github.com/nikhiljay" target="_blank">Saama</a>. <br /><br /> Check out my <a href="https://github.com/nikhiljay" target="_blank">Github</a> and <a href="https://github.com/nikhiljay" target="_blank">resume</a>.
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
    <SectionCaption>12 sections - 6 hours</SectionCaption>
    <SectionCellGroup>
      {staticdata.cells.map(cell => (
        <Cell
          title={cell.title}
          image={cell.image}
        />
      ))}
    </SectionCellGroup>
  </div>
)

export default IndexPage
