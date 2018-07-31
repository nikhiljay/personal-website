import React from 'react'
import styled from 'styled-components'
import background from '../images/purdue.jpg'

const SectionGroup = styled.div`
    background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${background});
    background-size: cover;
    background-position-y: 65%;
    position: relative;
    display: grid;
`

const SectionTitleGroup = styled.div`
    max-width: 1280px;
    position: relative;
    margin: auto;
    padding: 100px 50px;
`

const SectionTitle = styled.h3`
    color: white;
    font-size: 60px;
    margin: 0;
    line-height: 1.2;

    @media (max-width: 720px) {
        font-size: 40px;
    }
`

const Section = props => (
    <SectionGroup>
        <SectionTitleGroup>
            <SectionTitle>AI enthusiast.</SectionTitle>
            <SectionTitle>Eagle Scout.</SectionTitle>
            <SectionTitle>Apple WWDC Scholarship Winner.</SectionTitle>
        </SectionTitleGroup>
    </SectionGroup>
)

export default Section