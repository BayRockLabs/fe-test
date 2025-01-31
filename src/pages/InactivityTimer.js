import React, { useEffect, useState } from 'react';

const InactivityTimer = ({ onLogout }) => {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const resetTimer = () => {
      setIsActive(true);
    };

    // Add event listeners to track user activity
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'click', 'load', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  // Set timer for automatic logout
  useEffect(() => {
    let timeout;

    const setInactive = () => {
      setIsActive(false);
      timeout = setTimeout(() => {
        onLogout(); // Perform logout action
      }, 45 * 60 * 1000); // 45 * 60 * 1000 = 45 minutes
    };

    if (isActive) {
      setInactive();
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive, onLogout]);

  return null;
};

export default InactivityTimer;
