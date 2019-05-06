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
            siteURL
            twitter
            image
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
        <Helmet title={data.site.siteMetadata.title}>
          {/* Primary Meta Tags */}
          <meta name="title" content={data.site.siteMetadata.title} />
          <meta name="description" content={data.site.siteMetadata.description} />
          <meta name="keywords" content={data.site.siteMetadata.keywords} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content={data.site.siteMetadata.siteURL} />
          <meta property="og:title" content={data.site.siteMetadata.title} />
          <meta property="og:description" content={data.site.siteMetadata.description} />
          <meta property="og:image" content={data.site.siteMetadata.image} />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={data.site.siteMetadata.siteURL} />
          <meta property="twitter:creator" content={data.site.siteMetadata.twitter} />
          <meta property="twitter:title" content={data.site.siteMetadata.title} />
          <meta property="twitter:description" content={data.site.siteMetadata.description} />
          <meta property="twitter:image" content={data.site.siteMetadata.image} />
        </Helmet>
        {children}
        <Footer data={data}>
          © 2019, made by Nikhil D'Souza.
        </Footer>
      </>
    )}
  />
)

export default Layout