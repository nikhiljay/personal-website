import React from 'react'
import Favicon from 'react-favicon';
import Layout from '../components/layout'

const NotFoundPage = () => (
  <Layout>
    <div className="container">
      <Favicon url={require('../images/favicon.png')} />
      <div className="code-area">
        {/* eslint-disable-next-line */}
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
          <span style={{display: 'block'}}>&#125;</span>
        </span>
      </div>
    </div>
  </Layout>
)

export default NotFoundPage
