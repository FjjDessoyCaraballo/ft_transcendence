let worker: Worker | null = null;
let workerReady = false;
let pendingRequests: Array<{
	action: string;
	payload?: any;
	resolve: (value: any) => void;
	reject: (reason: any) => void;
  }> = [];

function initializeWorker() {
	if (typeof Worker === 'undefined') {
		console.error('Web workers are not supported in this environment');
		return ;
	}

	try {
		worker = new Worker(new URL('./TokenWorker.js', import.meta.url));

		worker.onmessage = (event) => {
			const { status, action, token, message } = event.data;

			const pendingRequests = pendingRequests.shift();

			if (pendingRequests) {
				if (status === 'success') {
					if (action === 'getToken') {
						pendingRequests.resolve(token);
					} else {
						pendingRequests.resolve(message || true);
					}
				} else {
					pendingRequests.reject(message || 'Unkown error');
				}
			}
		}

		worker.onerror = (error) => {
			console.error('Web Worker error:', error);
			const pendingRequests = pendingRequests.shift();
			if (pendingRequests) {
				pendingRequests.reject(error);
			}
		};

		workerReady = true;

		processPendingRequests();

	} catch (error) {
		console.error('Failed to initialize Web Worker', error);
	}
}

function processPendingRequests() {
	if (!worker || !workerReady) return ;
	while (pendingRequests.length > 0) {
		const request = pendingRequests[0];
		worker.postMessage({ action: request.action, payload: request.payload });
		break ;
	}
}

function sendMessage(action: string, payload?: any): Promise<any> {
	return new Promise((resolve, reject) => {
		pendingRequests.push({ action, payload, resolve, reject});

		if (worker && workerReady) {
			processPendingRequests();
		} else if (!worker) {
			initializeWorker();
		}
	});
}

export const setToken = (token: string): Promise<boolean> => {
	return sendMessage('setToken', token);
};

export const getToken = (): Promise<string | null> => {
	return sendMessage('getToken');
};

export const clearToken = (): Promise<boolean> => {
	return sendMessage('clearToken');
}

initializeWorker();