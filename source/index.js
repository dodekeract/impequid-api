import request from 'superagent';

export default class ImpequidAPI {

	constructor ({token, server = 'impequid.com', secure = true, port = 443, debug = false} = {}) {
		const arr = server.split(':');
		if (arr.length === 2 && port === 443) {
			server = arr[0];
			port = arr[1];
		}

		this.token = token;
		this.server = server;
		this.port = port;
		this.secure = secure;
		this.debug = debug;
	}

	api (endpoint) {
		return `http${this.secure ? 's' : ''}://${this.server}${((this.secure && this.port === 443) || (!this.secure && this.port === 80)) ? '' : `:${port}`}/api/external/${endpoint}`;
	}

	verify () {
		return new Promise((resolve, reject) => {
			this.get('verify')
				.end(this.c(resolve, reject));
		});
	}

	getBackgroundToken () {
		return new Promise((resolve, reject) => {
			this.get('background')
				.end(this.c(resolve, reject, 'token'));
		});
	}

	getUser () {
		return new Promise((resolve, reject) => {
			this.get('user')
				.end(this.c(resolve, reject));
		});
	}

	get (endpoint) {
		if (this.debug) console.log(`iqa GET ${this.api(endpoint)}`);
		return request.get(this.api(endpoint))
			.set('token', this.token);
	}

	c (resolve, reject, selector) {

		const {debug} = this;

		return function (error, response) {
			if (debug) {
				try {
					console.log('iqa', response.status, typeof response.body, response.body);
				} catch (e) {
					console.error('iqa', e, error);
				}
			}
			if (!error) {
				if (selector) {
					resolve(response.body[selector]);
				} else {
					resolve(response.body);
				}
			} else {
				reject(error);
			}
		}
	}

}

export class ServiceProvider {

	constructor ({server = 'services.impequid.com', cacheDuration = 60000, secure = true, port = 443, debug = false} = {}) {
		this.server = server;
		this.cacheDuration = cacheDuration;
		this.cache = new Map();
		this.secure = secure;
		this.port = port;
		this.debug = debug;
	}

	api (endpoint) {
		return `http${this.secure ? 's' : ''}://${this.server}${((this.secure && this.port === 443) || (!this.secure && this.port === 80)) ? '' : `:${port}`}/api/v1/${endpoint}`;
	}

	get (domain) {
		const {cache, cacheDuration} = this;

		return new Promise((resolve, reject) => {
			const {data, expires} = cache.get(domain) || {};

			if (expires > Date.now()) {
				resolve(data);
			} else {
				request
					.get(this.api(`basic/${domain}`))
					.end((error, response) => {
						if (response) {
							cache.set(domain, {
								expires: Date.now() + cacheDuration,
								data: response.body
							});
							if (!error) {
								resolve(response.body);
							} else {
								reject(response.body);
							}
						} else {
							reject(error);
						}
					});
			}
		});
	}

}
