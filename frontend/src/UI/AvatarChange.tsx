import React, { useState } from 'react'
// import { updateAvatar } from '../services/userService' // under work

export const AvatarChangePopup: React.FC<{onClick: () => void}> = ({ onClick }) => {
	const [errorMessage, setErrorMessage] = useState('');

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

		<div className="buttonsDiv">

			<form onClick={HandleNewAvatar}
			className="buttonsDiv">
				<input type="file" id="myFile" name="filename"/>
				<input type="submit"/>
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