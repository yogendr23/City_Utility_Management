import React, { useEffect } from 'react';
import './AboutUs.css';

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'Yogendra Sharma',
      github: 'https://github.com/YogendraBits',
      image: 'https://github.com/YogendraBits.png',
      bio: '2023sl93059@wilp.bits-pilani.ac.in',
    },
    {
      name: 'Trupti Koli',
      github: 'https://github.com/TruptiBits',
      image: 'https://github.com/TruptiBits.png',
      bio: '2023sl93075@wilp.bits-pilani.ac.in',
    },
    {
      name: 'Ishank',
      github: 'https://github.com/IshankBits',
      image: 'https://github.com/IshankBits.png',
      bio: '2023sl93020@wilp.bits-pilani.ac.in',
    },
    {
      name: 'Gaurav',
      github: 'https://github.com/GauravBits',
      image: 'https://github.com/GauravBits.png',
      bio: '2023sl93096@wilp.bits-pilani.ac.in',
    },
    {
      name: 'Rahaf',
      github: 'https://github.com/Rahaf321',
      image: 'https://github.com/Rahaf321.png',
      bio: '2023sl93083@wilp.bits-pilani.ac.in',
    },
  ];

  useEffect(() => {
    // Add scroll-triggered animation class when elements enter the viewport
    const handleScroll = () => {
      const teamMembers = document.querySelectorAll('.team-member');
      teamMembers.forEach((member) => {
        const memberPosition = member.getBoundingClientRect().top;
        if (memberPosition < window.innerHeight - 150) {
          member.classList.add('is-visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run on initial load

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="about-us">
      <h1 className="title">About Us</h1>
      <p className="intro">
        we are a team of passionate individuals striving to
        drive innovation and create impactful solutions in the tech industry.
      </p>
      <div className="team-container">
        {teamMembers.map((member) => (
          <div className="team-member" key={member.name}>
            <div className="image-container">
              <img
                src={member.image}
                alt={`${member.name}'s profile`}
                className="member-image"
              />
            </div>
            <h3 className="member-name">{member.name.split(' ')[0]}</h3>
            <p className="member-bio">{member.bio}</p>
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              GitHub
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
