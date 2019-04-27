import React from 'react'
import './post.css'

const Post = props => (
    <a href={props.link} target="_blank" rel="noopener noreferrer">
        <div className="Post">
            <div className="PostTitle">{props.title}</div>
            <img className="PostImage" src={props.image} alt={props.title} />
            <div className="PostDate">{props.date}</div>
        </div>
    </a>
)

export default Post