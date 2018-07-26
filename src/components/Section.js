import React from 'react'
import styled from 'styled-components'
import Wave from './Wave';

const SectionGroup = styled.div`
    background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${props => props.image});
    background-size: cover;
    margin-bottom: 80px;
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

const SectionText = styled.p`
    color: white;
    font-size: 24px;
`

const Section = props => (
    <SectionGroup image={props.image}>
        <SectionTitleGroup>
            <SectionTitle>{props.title}</SectionTitle>
            <SectionText>{props.text}</SectionText>
        </SectionTitleGroup>
    </SectionGroup>
)

export default Section