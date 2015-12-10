import Ldap from './Ldap';
import TokenStorage from './TokenStorage';
import crypto from 'crypto';

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

	verify(token) {
		return this.tokenStorage.verifyHash(token);
	}

	/**
	* Generate a new token for this user
	**/
	generateToken() {
		return (Math.random()*1e32).toString(36)
	}


}

export default LdapAuth;
