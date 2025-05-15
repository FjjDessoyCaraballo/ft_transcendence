let jwtToken = null;
let isLoggedIn = false;
let currentUser = null;


self.onmessage = function(event) {
	const { action, payload } = event.data;

	switch(action) {
		case 'setToken':
			jwtToken = payload;
			self.postMessage({
				status: 'success',
				action: 'setToken',
				message: 'Token stored successfully'
			});
			break ;
		case 'getToken':
			self.postMessage({
				status: 'success',
				action: 'getToken',
				token: jwtToken
			});
			break ;
		case 'setLoggedIn':
			isLoggedIn = payload.status,
			currentUser = payload.username || null;
			self.postMessage({
				status: 'success',
				action: 'setLoggedIn',
				message: 'Login status updated'
			});
			break ;
		case 'getAuthState':
			self.postMessage({
				status: 'success',
				action: 'getAuthState',
				isLoggedIn: isLoggedIn,
				currentUser: currentUser
			});
			break ;
		case 'clearToken':
			jwtToken = null;
			self.postMessage({
				status: 'success',
				action: 'clearToken',
				message: 'Token cleared successfully'
			});
			break ;
		default:
			self.postMessage({
				status: 'error',
				message: 'Unknown action'	
			});
	}
};