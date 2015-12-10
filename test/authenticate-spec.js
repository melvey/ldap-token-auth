// tests/authenticate-test.js
import {expect} from 'chai';
import should from 'chai-as-promised';
import LdapTokenAuth from '../LdapTokenAuth';
import params from './testParams';
import knex from 'knex';

// Use an sqlite in-memory database for testing - may not be true tests but it does test the code logic
params.knex = knex({
	client: 'sqlite3',
	connection: {filename: ':memory:'}
});


beforeEach(function() {
	knex('tokens').truncate();
})

describe('authenticate', function() {
	'use strict';
	it('Attempt valid authentication', function(done) {
		let authHandler = new LdapTokenAuth(params);
		authHandler.authenticate(params.validUser, params.validPassword)
		.then(function(result) {
			expect(result).to.not.be.false;
			done();
		}).catch(function(err) {
			done(err);
		});
	});

	it('Attempt invalid password', function(done) {
		let authHandler = new LdapTokenAuth(params);
		authHandler.authenticate(params.validUser, params.invalidPassword)
		.then(function(result) {
			expect(result).to.be.false;
			done();
		}).catch(function(err) {
			done(err);
		});
	});

});


describe('verify', function() {
	it('Verify correct token', function(done) {
		let authHandler = new LdapTokenAuth(params);
		authHandler.authenticate(params.validUser, params.validPassword)
		.then(function(token) {
			authHandler.verify(token).then(function(result){
				expect(result).to.be.a('string');
				done();
			});
		}).catch(function(err) {
			done(err);
		});
	});

	it('Attempt incorrect token', function(done) {
		let authHandler = new LdapTokenAuth(params);
		authHandler.verify('notatoken').then(function(result){
			expect(result).to.be.null;
			done();
		}).catch(function(err) {
			done(err);
		});
	});
});