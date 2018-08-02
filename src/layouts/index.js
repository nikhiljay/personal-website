import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import Header from '../components/header'
import './index.css'
import './Project.css'
import './404.css'
import Footer from '../components/Footer';

const Layout = ({ children, data }) => (
  <div>
    <Helmet
      title={data.site.siteMetadata.title}
      meta={[
        { name: 'title', content: data.site.siteMetadata.title },
        { name: 'description', content: data.site.siteMetadata.description },
        { name: 'keywords', content: data.site.siteMetadata.keywords },
        { property: 'og:image', content: require('../images/favicon.png') },
      ]}
    />
    {/* <Header /> */}
    {children()}
    <Footer data={data}>
      © 2018, made by Nikhil D'Souza.
    </Footer>
  </div>
)

Layout.propTypes = {
  children: PropTypes.func,
}

export default Layout

export const query = graphql`
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
`
