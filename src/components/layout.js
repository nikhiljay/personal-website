import React from 'react'
import Helmet from 'react-helmet'
import { StaticQuery, graphql } from 'gatsby'

import './layout.css'
import './project.css'
import './404.css'
import Footer from './footer';

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
            description
            keywords
          }
        }
        allContentfulLink(sort: {fields: [createdAt], order: ASC}) {
          edges {
            node {
              title
              url
              createdAt
            }
          }
        }
      }
    `}
    render={data => (
      <>
        <Helmet
          title={data.site.siteMetadata.title}
          meta={[
            { name: 'title', content: data.site.siteMetadata.title },
            { name: 'description', content: data.site.siteMetadata.description },
            { name: 'keywords', content: data.site.siteMetadata.keywords }
          ]}
        />
        {children}
        <Footer data={data}>
          © 2019, made by Nikhil D'Souza.
        </Footer>
      </>
    )}
  />
)

export default Layout