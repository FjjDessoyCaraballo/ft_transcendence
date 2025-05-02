import React from 'react';
import { Header } from './Header';
import { GDPRPopup } from '../UI/GDPRPopup';

export const AppLayout: React.FC = () => {
  return (
    <>
      <Header onClick={() => console.log('Header clicked')} />
      <main className="pt-20"> {/* Add padding-top equal to header height */}
        {/* The canvas element remains in the DOM */}
        <div className="button-container">
          {/* Move your buttons here from the HTML */}
        </div>
        <canvas id="gameCanvas" width="1200" height="800"></canvas>
      </main>
      <GDPRPopup
        onAccept={() => console.log('GDPR accepted')}
        onDecline={() => {
          console.log('GDPR declined');
          alert('You must accept the GDPR terms to use this application.');
        }}
      />
    </>
  );
};