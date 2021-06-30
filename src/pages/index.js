import * as React from "react"
import { FaTwitter, FaGithub, FaLinkedin, FaFileAlt } from 'react-icons/fa';
import { IoArrowForwardSharp } from "react-icons/io5"
import Profile from "../../static/profile.png"

import Layout from "../components/layout"
import "./index.css"

const IndexPage = () => (
  <Layout>
    <div className="header">
      <div className="name">
        <img src={Profile} alt="sup" width="80" style={{ float:`left`, borderRadius: `50%`, }} />
        <h1>Nikhil D'Souza</h1>
      </div>
      <div className="social">
        <a href="https://twitter.com/nikhiljay7" target="_blank" rel="noreferrer">
          <FaTwitter size={25} />
        </a>
        <a href="https://github.com/nikhiljay" target="_blank" rel="noreferrer">
          <FaGithub size={25} />
        </a>
        <a href="https://linkedin.com/in/nikhiljay7" target="_blank" rel="noreferrer">
          <FaLinkedin size={25} />
        </a>
        <a href="github.com/nikhiljay" target="_blank" rel="noreferrer">
          <FaFileAlt size={25} />
        </a>
      </div>
    </div>
    <br></br>
    <p>I’m a senior at Purdue studying computer science, data science, and applied statistics. I love learning, solving tough problems, and thinking about the intersection of health and artificial intelligence. I previously worked at Eli Lilly, Vincere Health, & others. Check out my blog, github, and resume.</p>
    <p>
    <a href="mailto:nikhiljay7@gmail.com">
      Contact me
      <IoArrowForwardSharp size={22} />
    </a>
    </p>
  </Layout>
)

export default IndexPage
