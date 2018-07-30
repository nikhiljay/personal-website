import React from 'react'

const NotFoundPage = () => (
  <div className="container">
    <div className="code-area">
      <span className="comment">// 404 page not found.</span>

      <span>
        <span className="if">if</span>
        <span className="condition"> (</span>
        <span className="blue">!</span><span className="condition">found)</span>
        <span> &#123;</span>
      </span>

      <span>
        <span className="nested blue">throw</span>
        <span>(<span className="message">"(╯°□°)╯︵ ┻━┻"</span>);</span>
        <span style={{ display: 'block'}}>&#125;</span>
      </span>
    </div>
  </div>
)

export default NotFoundPage
