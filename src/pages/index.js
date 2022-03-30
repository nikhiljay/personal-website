import * as React from "react";
import { withPrefix } from "gatsby";
import { FaTwitter, FaGithub, FaLinkedin, FaFileAlt } from "react-icons/fa";
import { IoArrowForwardSharp } from "react-icons/io5";
import { StaticImage } from "gatsby-plugin-image";

import Layout from "../components/layout";
import Seo from "../components/seo";
import "./index.css";

const IndexPage = () => (
  <Layout>
    <Seo title="Nikhil D'Souza" />
    <div className="header">
      <StaticImage
        src={"../images/profile.png"}
        alt="sup"
        placeholder="none"
        width="110"
        height="110"
        quality={100}
        imgStyle={{ borderRadius: `100%` }}
      />
      <div className="name">
        <h1>Nikhil D'Souza</h1>
        <div className="social">
          <a
            href="https://twitter.com/nikhiljdsouza"
            target="_blank"
            rel="noreferrer"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="https://github.com/nikhiljay"
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://linkedin.com/in/nikhiljay7"
            target="_blank"
            rel="noreferrer"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href={withPrefix("/nikhil_dsouza_resume.pdf")}
            target="_blank"
            rel="noreferrer"
          >
            <FaFileAlt size={20} />
          </a>
        </div>
      </div>
    </div>
    <p className="description">
      I am a senior at Purdue University graduating in data science, computer
      science, and applied statistics with a focus on AI/ML. I am the Co-Founder
      & CTO of{" "}
      <a href="https://vitalize.tech/" target="_blank" rel="noreferrer">
        Vitalize
      </a>
      , where we are building a digital wellness platform for the healthcare
      workforce.
      <br />
      <br />
      Before Vitalize, I was an early engineer at{" "}
      <a href="https://www.vincere.health/" target="_blank" rel="noreferrer">
        Vincere Health
      </a>
      , a digital health startup out of Harvard Innovation Labs. I also recently
      worked with{" "}
      <a href="https://www.lilly.com/" target="_blank" rel="noreferrer">
        Eli Lilly
      </a>{" "}
      to use predictive analytics with clinical data and bring new drugs to
      market.
      <br />
      <br />I love learning, solving tough problems, and thinking about the
      intersection of health and artificial intelligence. Check out my{" "}
      <a href="https://blog.nikhil.ai/" target="_blank" rel="noreferrer">
        blog
      </a>
      ,{" "}
      <a href="https://github.com/nikhiljay" target="_blank" rel="noreferrer">
        github
      </a>
      , and{" "}
      <a
        href={withPrefix("/nikhil_dsouza_resume.pdf")}
        target="_blank"
        rel="noreferrer"
      >
        resume
      </a>
      .
    </p>
    <p>
      <a href="mailto:nikhiljay7@gmail.com">
        Contact me
        <IoArrowForwardSharp size={22} />
      </a>
    </p>
  </Layout>
);

export default IndexPage;
