import React from 'react'
import './post.css'

const Post = props => (
    <a href={props.link} target="_blank">
        <div className="Post">
            <div className="PostTitle">{props.title}</div>
            <img className="PostImage" src={props.image} />
            <div className="PostDate">{props.date}</div>
        </div>
    </a>
)

export default Post