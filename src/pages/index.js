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
            href="https://linkedin.com/in/nikhiljay7"
            target="_blank"
            rel="noreferrer"
          >
            <FaLinkedin size={20} />
          </a>
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
      I am pursuing a Master's in Data Science at Columbia University. I recently graduated from Purdue University in Computer Science, Data Science, and Applied Statistics.
      <br />
      <br />I love learning, solving tough problems, and thinking about the
      intersection of artificial intelligence, health, and finance. In my free time, I
      enjoy playing chess, tennis, and the piano! Check out my{" "}
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
      <a href="mailto:nikhil.d@columbia.edu">
        Get in touch
        <IoArrowForwardSharp size={22} />
      </a>
    </p>
  </Layout>
);

export default IndexPage;
