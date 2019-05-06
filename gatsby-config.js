module.exports = {
  siteMetadata: {
    title: 'Nikhil D\'Souza',
    description: 'Nikhil\'s personal website.',
    siteURL: 'https://nikhiljay.com',
    twitter: 'nikhiljay7',
    image: '/images/meta_image.png',
    keywords: 'tech, science, machine learning, artificial intelligence, ios development, web development, palo alto, gunn, purdue'
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-contentful',
      options: {
        spaceId: 'qd3fn9ngw366',
        accessToken: 'b5101be5b4bbaace4b4b80448f99832c1b7c1207daa826c9b88ca37e275ebf77'
      }
    },
    'gatsby-plugin-styled-components'
  ],
}