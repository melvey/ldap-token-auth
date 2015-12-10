// tests/authenticate-test.js
import {expect} from 'chai';
import LdapTokenAuth from '../LdapTokenAuth';
import params from './testParams';
import knex from 'knex';

// Use an sqlite in-memory database for testing - may not be true tests but it does test the code logic
params.knex = knex({
	client: 'sqlite3',
	connection: {filename: ':memory:'}
});

describe('authenticate', function() {
	'use strict';
	it('Attempt valid authentication', function(done) {
		let authHandler = new LdapTokenAuth(params);
		authHandler.authenticate(params.validUser, params.validPassword)
		.then(function(result) {
			expect(result).to.not.be.false;
			done();
		});
	});

	it('Attempt invalid password', function(done) {
		let authHandler = new LdapTokenAuth(params);
		authHandler.authenticate(params.validUser, params.invalidPassword)
		.then(function(result) {
			expect(result).to.be.false;
			done();
		});
	});

});


describe('verify', function() {
	it('Verify correct token', function() {
		let authHandler = new LdapTokenAuth(params);
		authHandler.authenticate(params.validUser, params.validPassword)
		.then(function(token) {
			authHandler.verify(params.validUser, token).then(function(result){
				expect(result).to.be(true);
			});
		});
	});
});