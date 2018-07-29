import React from 'react'

const Brainwaves = () => (
    <div>
        <section id="section-title">
            <div className="background"></div>
            <div className="title">
                <h1>Measuring Brainwaves</h1>
                <h2>The next dimension of technology.</h2>
            </div>
            <div className="mask"></div>
        </section>

        <section id="content-body">
            <div className="wrapper">
                <h2>AAR</h2>
                <p>As a sophomore in high school, I participated in the Advanced Authentic Research program in my school. For my project, I developed an iOS app that measures emitted brain waves using an Emotiv headset and gives feedback based on a person’s behavior.</p>
                <center><img alt="About this Course" src="https://aar.pausd.org/sites/default/files/aar8.png" height="100" width="100" /></center>
            </div>
            <div className="wrapper">
                <h2>The Brain</h2>
                <p>The human brain is the most mysterious biological organs on our planet. It is so advanced that even humans are not able to understand it to our full capacity. However recently, scientists have been able to recognize that there is energy being emitted from the brain. All of our brains are made up of billions of neurons or, specialized cells transmitting nerve impulses. These neurons use electricity to communicate. When millions of these neurons communicate at once, this generates a significant amount energy. Scientists say that the brain can produce as much as 10 watts of electricity. This energy is in the form of waves, also known as “brain waves” or “neural oscillations”. Brain waves are important because they represent the activity inside our brain. All our thoughts, emotions, and behaviors are results of our neurons communicating with each other.</p>
                <center><img alt="About this Course" src={require('../images/projects/brainwaves-app.png')} width="200" /></center>
            </div>
            <div className="wrapper">
                <h2>Impact</h2>
                <p>There are over 1.4 million people annually in the United States that suffer a traumatic brian injuries and over 50,000 of those people die. By improving neurotechnology, doctors will be able to save thousands of lives each year.</p>
                <center><img alt="About this Course" src="https://4.bp.blogspot.com/-ONY7HcFl4xo/U55Ob8nve3I/AAAAAAAAJ9E/FLJjWafqok4/s1600/Computerized-brain-made-of-GPUs.jpg" width="403" /></center>
            </div>
            <div className="wrapper">
                <h2>Video</h2>
                <center><iframe width="80%" height="400" src="https://www.youtube.com/embed/X2r8DeZYR34" allowFullScreen="true"></iframe></center>
            </div>
            <div className="wrapper">
                <p>Check out this <a href="http://www.paloaltopulse.com/2016/05/18/3-reasons-why-palo-alto-students-are-buzzing-about-aar/" target="_blank">article</a>, featuring a picture of me at the top. This project is open-source! See the whole project on my <a href="https://github.com/nikhiljay/brainwaves" target="_blank">Github</a>.</p>
            </div>
        </section>
    </div>
)

export default Brainwaves
