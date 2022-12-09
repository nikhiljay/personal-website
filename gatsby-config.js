/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: "Nikhil D'Souza",
    description:
      "Currently Cofounder & CTO of Vitalize, where we're building a platform to help improve the mental health of our healthcare workers.",
    siteURL: "https://nikhil.ai",
    author: "@nikhiljdsouza",
    image: "/images/screenshot.png",
    keywords:
      "vitalize, mental health, ycombinator, startup, yc, artificial intelligence, data science, machine learning, ai, healthcare, ml, purdue, columbia, palo alto, gunn",
  },
  plugins: [
    'gatsby-plugin-postcss',
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Nikhil D\'Souza`,
        short_name: `Nikhil`,
        start_url: `/`,
        background_color: `#1d1f21`,
        theme_color: `#1d1f21`,
        display: `minimal-ui`,
        icon: `src/images/favicon.png`, // This path is relative to the root of the site.
      },
    },
  ],
}
