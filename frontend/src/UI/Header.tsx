import React, { useState, useEffect } from 'react';

interface HeaderProps {
	onClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onClick }) => {
	return (
		<header className="fixed top-0 left-0 w-full bg-[url('../assets/header.png')] z-[9999] shadow-md">
			<div className="container mx-auto px-4 py-3 flex justify between items-center">
				<h1 className="titles ">Transcendence</h1>
				{/*placeholder for anything else that could go with title*/}
				<div className="space-x-4">
					{/* placeholder for buttons */}
				</div>
			</div>
		</header>
	);
};