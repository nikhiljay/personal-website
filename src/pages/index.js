import * as React from "react"
import { withPrefix } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import { FaTwitter, FaGithub, FaLinkedin, FaFileAlt, FaLocationArrow } from "react-icons/fa";

import Layout from "../components/layout"
import Seo from "../components/seo"

const IndexPage = () => (
  <Layout>
    <img
      src='../images/blue-ellipse.svg'
      alt=""
      draggable="false"
      className="fixed top-0 left-0 select-none"
    />
    <img
      src='../images/orange-ellipse.svg'
      alt=""
      draggable="false"
      className="fixed -bottom-10 -right-10 select-none"
    />
    <div className="relative mx-auto max-w-3xl py-24 sm:py-40 px-10">
      <div className="sm:flex justify-between items-center">
        <div className="flex items-center">
          <StaticImage
            src={"../images/profile.png"}
            alt="sup"
            placeholder="none"
            quality={100}
            draggable="false"
            imgStyle={{ borderRadius: `100%` }}
            className="select-none w-20 sm:w-25"
          />
          <div className="ml-4">
            <h1 className="font-extrabold text-2xl sm:text-4xl text-white antialiased -mb-1">Nikhil D'Souza</h1>
            <FaLocationArrow size={12} className="inline-block text-slate-400 mr-1.5 mb-0.5" />
            <p className="inline-block text-slate-400 text-md font-medium antialiased">San Francisco, CA</p>
          </div>
        </div>
        <div className="hidden sm:block flex-initial h-5">
          <a
            href="https://www.linkedin.com/in/nikhiljdsouza/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="transition ease-in-out duration-200 inline-block text-white mr-3 hover:text-linkedin-blue"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="https://twitter.com/nikhiljdsouza"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
            className="transition ease-in-out duration-200 inline-block text-white mr-3 hover:text-twitter-blue"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://github.com/nikhiljay"
            target="_blank"
            rel="noreferrer"
            aria-label="Github"
            className="transition ease-in-out duration-200 inline-block text-white mr-3 hover:text-github-purple"
          >
            <FaGithub size={24} />
          </a>

          <a
            href={withPrefix("/nikhil_dsouza_resume.pdf")}
            target="_blank"
            rel="noreferrer"
            aria-label="Resume"
            className="transition ease-in-out duration-200 inline-block text-white hover:text-orange-400"
          >
            <FaFileAlt size={24} />
          </a>
        </div>
      </div>
      <p className="text-slate-400 antialiased my-6 text-lg">Currently Co-Founder & CTO of <a href="https://vitalizecare.co" target="_blank" rel="noreferrer" className="transition ease-in-out duration-200 text-orange-400 hover:text-orange-500 font-semibold">Vitalize Care</a>, where we're building a platform to help improve the mental health of our healthcare workers. I love learning, telling stories with data, and thinking about the intersection of AI & health. In my free time, I enjoy playing chess, tennis, and the piano.</p>
      <a
        href="mailto:nikhiljay7@gmail.com"
        className="transition ease-in-out duration-200 inline-block text-md antialiased font-medium rounded-md bg-orange-400 px-4 mr-3 py-2 text-white shadow-sm hover:bg-orange-500"
      >
        Contact me
      </a>
      <a
        href="https://www.linkedin.com/in/nikhiljdsouza/"
        className="transition ease-in-out duration-200 text-md antialiased font-semibold rounded-md bg-slate-800 px-4 py-2 text-white ring-1 ring-slate-700 hover:bg-slate-700 hover:ring-slate-700 hidden sm:inline-block"
        target="_blank"
        rel="noreferrer"
      >
        See more on LinkedIn
      </a>
      <a
        href="https://www.linkedin.com/in/nikhiljdsouza/"
        className="transition ease-in-out duration-200 text-md antialiased font-semibold rounded-md bg-slate-800 px-4 py-2 text-white ring-1 ring-slate-700 hover:bg-slate-700 hover:ring-slate-700 inline-block sm:hidden"
        target="_blank"
        rel="noreferrer"
      >
        LinkedIn
      </a>
    </div>
</Layout>
)

export const Head = () => <Seo title="Nikhil D'Souza" />

export default IndexPage
