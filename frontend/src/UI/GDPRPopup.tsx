import React, { useState, useEffect } from 'react';
import '../styles/gdpr-popup.css'

// TODO: scrollable menu and handle decline


interface GDPRPopupProps {
	onAccept: () => void;
	onDecline: () => void;
}

export const GDPRPopup: React.FC<GDPRPopupProps> = ({ onAccept, onDecline }) => {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const hasAccepted = localStorage.getItem('gdpr-accepted');
		if (hasAccepted === 'true') {
			setVisible(false);
		}

	}, []);

	const handleAccept = () => {
		localStorage.setItem('gdpr-accepted', 'true')
		setVisible(false);
		onAccept();
	};

	const handleDecline = () => {
		setVisible(false);
		onDecline();
	};

	if (!visible) return null;

	return (
		<div className="gdpr-popup">
			<div className="gdpr-content">
				<h2 className="gdpr-title">GDPR Disclosure</h2>
				<div className="gdpr-content-scrollable">
				<p>
					This website stores data locally in your computer using 
					localStorage to enchance your gaming experience.
					This includes user account information and game metrics.
					This information is saved in our servers for one day solely for the purpose
					of displaying the gaming metrics for the player and making it possible for you
					to log into your account again after the browser is closed.
				</p>
				<p>
					For any inquiries or questions, you can contact the data protection officer: 
					Felipe Dessoy, fdessoy-@hive.student.fi
				</p>
				</div>
				<div className='gdpr-buttons'>
					<button className="decline-button" onClick={handleDecline}>Decline</button>
					<button className="accept-button" onClick={handleAccept}>Accept</button>
				</div>
			</div>
		</div>
	);
};