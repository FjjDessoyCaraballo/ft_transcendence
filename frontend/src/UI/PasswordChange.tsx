import  React, { useState } from 'react'
import { changePassword } from '../services/userService'

export const PasswordChangePopup: React.FC<{onClose: () => void}> = ({ onClose }) => {
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		setErrorMessage('');

		if (newPassword !== confirmPassword) {
			setErrorMessage("Passwords don't match!");
			return ;
		}

		try {
			setIsSubmitting(true);
			await changePassword({
				oldPassword: oldPassword,
				newPassword: newPassword
			})
			.then(() => {
				alert("Password changed successfully!");
				onClose();
			})

		} catch (error) {
			console.error("Password change failed: ", error);
			alert('Failed to change password. Please try again later.');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
	<div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
		<div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[90%] max-h-[80vh] flex flex-col overflow-hidden mx-auto">
		  <div className="p-6 bg-[#4B0082] text-white">
			<h2 className="text-2xl font-bold font-mono">Password Change</h2>
		  </div>

		  <form onSubmit={handleSubmit} className="p-6">
			{errorMessage && (
			  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
				{errorMessage}
			  </div>
			)}

			<div className="mb-4">
			  <label
				htmlFor="oldPassword"
				className="block text-gray-700 font-mono mb-2"
			  >
				Current Password
			  </label>
			  <input
				type="password"
				id="oldPassword"
				placeholder="Enter your current password"
				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
				value={oldPassword}
				onChange={(e) => setOldPassword(e.target.value)}
				required
			  />
			</div>

			<div className="mb-4">
			  <label
				htmlFor="newPassword"
				className="block text-gray-700 font-mono mb-2"
			  >
				New Password
			  </label>
			  <input
				type="password"
				id="newPassword"
				placeholder="Create a new password"
				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
				value={newPassword}
				onChange={(e) => setNewPassword(e.target.value)}
				required
				minLength={8}
			  />
			</div>

			<div className="mb-6">
			  <label
				htmlFor="confirmPassword"
				className="block text-gray-700 font-mono mb-2"
			  >
				Confirm New Password
			  </label>
			  <input
				type="password"
				id="confirmPassword"
				placeholder="Confirm your new password"
				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				required
			  />
			</div>

			<div className="flex justify-end gap-3">
			  <button
				type="button"
				onClick={onClose}
				className="px-5 py-2 rounded bg-gray-200 text-gray-800 font-mono transition-colors hover:bg-gray-300"
			  >
				Cancel
			  </button>
			  <button
				type="submit"
				disabled={isSubmitting}
				className="px-5 py-2 rounded bg-[#800080] text-white font-mono transition-colors hover:bg-[#4B0082] disabled:opacity-50 disabled:cursor-not-allowed"
			  >
				{isSubmitting ? 'Processing...' : 'Change Password'}
			  </button>
			</div>
		  </form>
		</div>
	  </div>
	);
};
