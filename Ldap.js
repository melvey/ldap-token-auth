import ldap from 'ldapjs';
import Promise from 'bluebird';

class Ldap {

	constructor(params) {
		this.uidField = params.uidField || 'uid';
		
		this.client = ldap.createClient({
			url: params.server
		});

		this.base = params.base;
	}

	searchUser(username) {
		return new Promise((resolve, reject) => {
			this.client.search(this.base, {
				filter: '(' + this.uidField + '=' + username + ')',
				scope: 'sub',
				sizeLimit: 1
			},
			function(err, res) {
				if(err) {
					reject(err);
				} else {
					let resolved = false;
					res.on('searchEntry', function(entry) {
						resolved = true;
						resolve(entry.object);
					});
					/* I don't even know what a searchReference is
					res.on('searchReference', function(referral) {
						console.log('referral: ' + referral.uris.join());
					});
					*/
					res.on('error', function(err2) {
						reject(err2);
					});
					res.on('end', function() {
						if(!resolved) {
							reject(new Error('No matching user'));
						}
					});
				}
			});
		});
	}


	authenticate(username, password) {
		let client = this.client;
		return new Promise((resolve, reject) => {
			this.searchUser(username)
			.then((user) => {
				client.bind(user.dn, password, function(err) {
					if(!err) {
						resolve(true);
					} else {
						resolve(false);
					}
				});
			});
		});
	}
}

export default Ldap;
