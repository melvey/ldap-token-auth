import Ldap from './Ldap';
import TokenStorage from './TokenStorage';


class LdapAuth {

	constructor(params) {
		this.ldap = new Ldap(params);
		this.tokenStorage = new TokenStorage(params);
	}

	authenticate(username, password) {
		return this.ldap.authenticate(username, password)
		.then((result) => {
			let returnVal = false;
			if(result) {
				let token = this.generateToken(username);
				this.tokenStorage.saveHash(username, token);
				returnVal = token;
			}
			return returnVal;
		});
	}

	verify(username, token) {
		return this.tokenStorage.verifyHash(username, token);
	}

	generateToken(username) {
		let hashString = username + Date.now();

		let hash = 0;
		if (hashString.length === 0) return hash;
		for (let i = 0; i < hashString.length; i++) {
			let char = hashString.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	}


}

export default LdapAuth;
