import React from 'react'
import styled from 'styled-components'
import './Post.css'

const Post = props => (
    <a href={props.link} target="_blank">
        <div className="PostGroup">
            <div className="PostTitle">{props.title}</div>
            <div className="PostText">{props.text}</div>
            <div className="PostDate">{props.date}</div>
        </div>
    </a>
)

export default Post