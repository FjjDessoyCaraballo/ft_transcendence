import React, { useState, useRef } from 'react'
import { updateAvatar } from '../services/userService' // under work

export const AvatarChangePopup: React.FC<{onClick: () => void}> = ({ onClick }) => {
	const [errorMessage, setErrorMessage] = useState('');
	const [preview, setPreview] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [base64, setBase64] = useState<string>('');
	const [fileSize, setFileSize] = useState<number>(0);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const showMeasures = 'Files must be in jpg or png format no bigger than 2MB';
	
	const HandleNewAvatar = async (event: React.FormEvent) => {
		event.preventDefault();

		setErrorMessage('');
		setIsLoading(true);
		try {
			await updateAvatar({
				data: base64.split(',')[1],
				size: fileSize
			});
		} catch (error) {
			console.error(`${error}`);
			alert("Failed to load image!");
		} finally {
			setIsLoading(false);
		}

		onClick();
	}

	const HandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;

		setIsLoading(true);
		if (!files || files.length === 0)
			return ;
		const file = files[0];

		if (!file.type.startsWith('image/')) {
			setErrorMessage('Please select an image file');
			return ;
		}

		setFileSize(file.size);

		setPreview(URL.createObjectURL(file));
		const reader = new FileReader();
		reader.onloadend = () => {
			setBase64(reader.result as string);
			setIsLoading(false);
		};
		reader.readAsDataURL(file);
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
				onChange={HandleChange}
				/>
			</form>
			
			{preview && (
			<div className="mb-4 flex justify-center">
			<img
				src={preview}
				alt="Avatar preview"
				className="max-h-48 max-w-full object-contain rounded border border-gray-300"
			/>
			</div>)}
		</div>

        <div className="buttonsDiv">
            <button 
              type="button"
              className="buttonsStyle bg-gray-200 text-gray-800 transition-colors hover:bg-gray-300"
			  disabled={isLoading}
              onClick={HandleClose}
            >
              Cancel
			</button>
            <button 
              type="submit"
              className="px-5 py-2 rounded bg-[#800080] text-white font-mono transition-colors hover:bg-[#4B0082]" 
			  disabled={isLoading}
			  onClick={HandleNewAvatar}
            >
              Update
            </button>
		</div>
		</div>
	  </div>	
	);
};
