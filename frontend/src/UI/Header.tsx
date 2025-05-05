import React, { useState, useEffect } from 'react';
import { GDPRPopup } from './GDPRPopup'

interface HeaderProps {
	onClick: () => <GDPRPopup></GDPRPopup>;
}

export const Header: React.FC<HeaderProps> = ({ onClick }) => {
	const [showGDPR, setShowGDPR] = useState(false);

	const HandleRegistrationClick = () => {
		setShowGDPR(true);
	};

	const HandleGDPRClose = () => {
		setShowGDPR(false);
	};



	return (
		<>
		<header className="fixed top-0 left-0 w-full bg-[url('../assets/header.png')] bg-cover bg-no-repeat bg-center z-[9999] shadow-md">
			<div className="container mx-auto px-4 py-3 flex justify-between items-center">
				<h1 className="p-5 pb-2 m-0 text-4xl font-mono font-bold text-[#4B0082]">
					Transcendence
				</h1>
				{/*placeholder for anything else that could go with title*/}
				<div className="space-x-8 place-items-right flex">
				<button className="px-4 py-2 bg-[#4B0082] text-[#C8A2C8] font-mono rounded hover:bg-[#800080] transition-colors ">
					Login
				</button>
				<button className="px-1 py-2 bg-[#4B0082] text-[#C8A2C8] font-mono rounded hover:bg-[#800080] transition-colors">
					Registration
				</button>
				<button className="px-4 py-2 bg-[#4B0082] text-[#C8A2C8] font-mono rounded hover:bg-[#800080] transition-colors">
					Settings
				</button>
				</div>
			</div>
		</header>
		{!showGDPR && (
			<GDPRPopup
			onAccept={() => {
				console.log('GDPR accepted');
				setShowGDPR(false);
			}}
			onDecline={() => {
				console.log('GDPR declined');
				setShowGDPR(false);
			}}
			/>
			)}
		</>
		);
};

// [#800080] deep purple
// [#4B0082] purple
// [#C8A2C8] light purple