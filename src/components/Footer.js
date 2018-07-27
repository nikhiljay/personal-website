import React from 'react'
import styled from 'styled-components'
import { SocialIcon } from 'react-social-icons';

const FooterGroup = styled.div`
    background: #F1F3F5;
    padding: 50px 0;
    display: grid;
    grid-gap: 20px;
`
const Text = styled.p`
    font-size: 30px;
    font-weight: 600;
    color: #486791;
    max-width: 500px;
    margin: 0 auto;
`

const SocialGroup = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 40px;
    margin: 20px auto;

    @media (max-width: 640px) {
        grid-gap: 20px;
    }
`

// const LinkGroup = styled.div`
//     width: 500px;
//     margin: 50px auto;
//     display: grid;
//     grid-template-columns: repeat(2, 1fr);
//     grid-gap: 10px;

//     a {
//         transition: 0.8s;
//     }

//     a:hover {
//         color: black;
//     }
// `

const Copyright = styled.div`
    color: #486791;
    max-width: 500px;
    margin: 0 auto;
    padding: 0 20px;
`

const Footer = ({ data, children }) => (
    <FooterGroup>
        <Text>Let's keep in touch.</Text>
        <SocialGroup>
            <SocialIcon url="https://twitter.com/nikhiljay7" />
            <SocialIcon url="https://medium.com/@nikhiljay" />
            <SocialIcon url="https://github.com/nikhiljay" />
            <SocialIcon url="https://linkedin.com/in/nikhiljay7" />
            <SocialIcon url="mailto:nikhiljay@purdue.edu" />
        </SocialGroup>
        {/* <LinkGroup>{data.allContentfulLink.edges.map(edge => (
            <a href={edge.node.url}>{edge.node.title}</a>
        ))}</LinkGroup> */}
        <Copyright>{children}</Copyright>
    </FooterGroup>
)

export default Footer