import React from 'react'
import styled from 'styled-components'
import Wave from './Wave';

const SectionGroup = styled.div`
    background: url(${props => props.image});
    height: 500px;
    background-size: cover;
    margin-bottom: 80px;
    display: grid;
`

const SectionTitleGroup = styled.div`
    width: 1280px;
    margin: auto;
    position: relative;
    align-self: end;

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
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