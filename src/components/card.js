import React from 'react'
import './card.css'

const Card = props => (
    <a href={props.link}>
        <div className={props.light ? 'Card' : 'Card dark'}>
            <img src={props.image} alt={props.title} />
            <h3>{props.title}</h3>
            <p>{props.text}</p>
        </div>
    </a>
)

export default Card