module.exports = {
  siteMetadata: {
    title: 'Nikhil D\'Souza',
    description: 'Passionate about building innovative projects with AI and tech. Studying computer science, data science, and applied statistics at Purdue.',
    siteURL: 'https://nikhil.ai',
    author: '@nikhiljdsouza',
    image: '/images/screenshot.png',
    keywords: 'tech, artificial intelligence, data science, machine learning, ai, healthcare, ml, purdue, west lafayette, palo alto, gunn'
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
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
        name: `Nikhil D'Souza`,
        short_name: `Nikhil`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#fff`,
        display: `minimal-ui`,
        icon: `src/images/rocket-icon.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-gatsby-cloud`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-svg`,
  ],
}
