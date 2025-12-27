import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <span>© {new Date().getFullYear()} GearGuard. All rights reserved.</span>
      <span>Made with ❤️ for reliability.</span>
    </div>
  </footer>
);

export default Footer;
