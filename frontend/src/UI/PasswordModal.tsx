import React, { useState } from 'react';

interface PasswordModalProps {
	opponentName: string;
	visible: boolean;
	onSubmit: (password: string) => void;
	onCancel: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
	opponentName,
	visible,
	onSubmit,
	onCancel,
}) => {
	const [password, setPassword] = useState('');

	if (!visible) return null;

	const handleSubmit = () => {
		onSubmit(password);
		setPassword('');
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-[#FFFFF0] p-8 rounded-xl w-80 shadow-lg text-center">
				<h2 className="text-xl font-semibold text-[#1B3A2D] mb-4">
					Hello {opponentName}!
					<br />
					Please type in your password to start the game
				</h2>
				<input
					type="password"
					className="w-full px-4 py-2 border-2 border-gray-300 rounded-md mb-4 text-lg"
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button
					className="w-full bg-[#1B3A2D] text-white py-2 rounded-md text-lg hover:bg-[#334F3C] transition"
					onClick={handleSubmit}
				>
					Submit
				</button>
				<button
					className="w-full bg-red-600 text-white py-2 rounded-md text-lg hover:bg-red-700 transition mt-2"
					onClick={onCancel}
				>
					Cancel
				</button>
			</div>
		</div>
	);
};

export default PasswordModal;
