import React, { useState, useRef } from 'react'
// import { updateAvatar } from '../services/userService' // under work

export const AvatarChangePopup: React.FC<{onClick: () => void}> = ({ onClick }) => {
	const [errorMessage, setErrorMessage] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);
	// const [showMeasures, setShowMeasures] = useState('');

	const showMeasures = 'Files must be in jpg or png format no bigger than 20MB';
	// setShowMeasures();
	const HandleNewAvatar = async (event: React.FormEvent) => {
		event.preventDefault();

		setErrorMessage('');
		onClick();
	}

	const HandleClose = () => {
		onClick();
	}

	return (
	<div className="fixed inset-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-[9999]">
		<div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[90%] max-h-[80vh] flex flex-col overflow-hidden mx-auto">
		  <div className="p-6 bg-[#4B0082] text-white">
			<h2 className="text-2xl font-bold font-mono">Avatar Change</h2>
		  </div>
		{showMeasures && 
				<div className="mx-6 mt-4 p-3 font-mono rounded-md">
			{showMeasures}
		</div>}
		{errorMessage &&
		<div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-md">
			{errorMessage}
		</div>}

		<div className="buttonsDiv">
			<form onSubmit={HandleNewAvatar}
			className="p-6">
				<label htmlFor="avatar" className="buttons">Avatar</label>
				<input
				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
				type="file"
				id="avatar" 
				name="avatar"
				ref={fileInputRef}
				accept="image/*"
				/>
			</form>
		</div>

        <div className="buttonsDiv">
            <button 
              type="button"
              className="buttonsStyle bg-gray-200 text-gray-800 transition-colors hover:bg-gray-300" 
              onClick={HandleClose}
            >
              Cancel
			</button>
		</div>
		</div>
	  </div>	
	);
};

			{/* <button 
              type="submit"
              className="buttonsStyle"
			  onClick={HandleNewAvatar}
			>
      		Upload
          	</button> */}