import * as React from "react"
import { withPrefix } from "gatsby"
import { FaTwitter, FaGithub, FaLinkedin, FaFileAlt } from 'react-icons/fa';
import { IoArrowForwardSharp } from "react-icons/io5"
import Profile from "../../static/profile.png"

import Layout from "../components/layout"
import Seo from "../components/seo";
import "./index.css"

const IndexPage = () => (
  <Layout>
  <Seo title="Nikhil D'Souza" />
    <div className="header">
      <img src={Profile} alt="sup" width="100" style={{ float:`left`, borderRadius: `50%`, }} />
      <div className="name">
        <h1>Nikhil D'Souza</h1>
        <div className="social">
          <a href="https://twitter.com/nikhiljdsouza" target="_blank" rel="noreferrer">
            <FaTwitter size={20} />
          </a>
          <a href="https://github.com/nikhiljay" target="_blank" rel="noreferrer">
            <FaGithub size={20} />
          </a>
          <a href="https://linkedin.com/in/nikhiljay7" target="_blank" rel="noreferrer">
            <FaLinkedin size={20} />
          </a>
          <a href={withPrefix("/docs/nikhil_dsouza_resume.pdf")} target="_blank" rel="noreferrer">
            <FaFileAlt size={20} />
          </a>
        </div>
      </div>
    </div>
    <p className="description">I’m a senior at Purdue studying computer science, data science, and applied statistics. I love learning, solving tough problems, and thinking about the intersection of health and artificial intelligence. I previously worked at <a href="https://www.lilly.com/" target="_blank" rel="noreferrer">Eli Lilly</a>, <a href="https://www.vincere.health/" target="_blank" rel="noreferrer">Vincere Health</a>, & others. Check out my <a href="https://blog.nikhil.ai/" target="_blank" rel="noreferrer">blog</a>, <a href="https://github.com/nikhiljay" target="_blank" rel="noreferrer">github</a>, and <a href={withPrefix("/docs/nikhil_dsouza_resume.pdf")} target="_blank" rel="noreferrer">resume</a>.</p>
    <p>
    <a href="mailto:nikhiljay7@gmail.com">
      Contact me
      <IoArrowForwardSharp size={22} />
    </a>
    </p>
  </Layout>
)

export default IndexPage
