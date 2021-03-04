/**
 * @file Simple `fetch` wrapper for JSON based requests.
 * @author Ben Worthington
 * @module comms
 * @license MIT
 */

/**
 * Global method for fetching a resource from the network.
 * @external fetch
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch|fetch()}
 */

/**
 * Global object containing utility methods to work with the query string of a URL.
 * @external URLSearchParams
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 */

/**
 * @typedef {Object} ResponseWrapper
 * @property {Object} [body] - The parsed `Response` stream
 * @property {Response} [response] - The `Response` object
 */

/**
 * Default timeout in milliseconds.
 *
 * @constant {number}
 * @default
 */
const DEFAULT_TIMEOUT = 30 * 1000;

function buildFetchOptions({ abortController, jsonBody, searchParams, timeout, ...fetchOptions }, signal) {
	fetchOptions.signal = signal;

	if (!(fetchOptions.headers instanceof Headers)) {
		fetchOptions.headers = new Headers(fetchOptions.headers);
	}

	if (!fetchOptions.headers.has('accept')) {
		fetchOptions.headers.set('accept', 'application/json');
	}

	if (jsonBody) {
		fetchOptions.body = JSON.stringify(jsonBody);

		if (!fetchOptions.headers.has('content-type')) {
			fetchOptions.headers.set('content-type', 'application/json');
		}
	}

	return fetchOptions;
}

function getContentTypeErrorMessage(url, contentType) {
	return `${ url } responded with Content-Type ${ contentType }.`;
}

function getNetworkErrorMessage(url, response) {
	return `${ url } responded with ${ response.status }.`;
}

function getTimeoutErrorMessage(url, timeout) {
	return `${ url } timed out after ${ timeout }ms.`;
}

/**
 * Simple `fetch` wrapper for JSON based requests.
 * - Provides timeout functionality
 * - Unlike `fetch` errors on a response status >= 500
 * - Does not error on `AbortController` `abort()`, simply returns `undefined` response body and `Response` object
 *
 * @async
 * @param {string} url - URL of the resource to request
 * @param {Object} [options] - An object containing any `fetch` settings plus additional settings detailed below
 * @param {AbortController} [options.abortController] - An `AbortController` object instance to abort the request,
 *     this is the preferred way to use an `AbortController`, if an `AbortController` `signal` is passed in the
 *     `options` then this will be overwritten
 * @param {Object} [options.jsonBody] - The request body as an object which can be converted to a `string` via
 *     `JSON.stringify()`, will overwrite any `options.body`
 * @param {Object} [options.searchParams] - Any value accepted by URLSearchParams constructor which will be appended to
 *     the request URL
 * @param {number} [options.timeout] - The request timeout in milliseconds, if not supplied it defaults to
 *     `DEFAULT_TIMEOUT`, if `0` or `Infinity` are provided then the request will not timeout
 * @throws {NetworkError} - If the response status is 500 or above
 * @throws {TimeoutError} - If the request reaches the timeout limit
 * @throws {TypeError} - If the specified URL string includes user credentials, see {@link fetch}
 * @throws {TypeError} - If the `fetch` fails (connection refused)
 * @throws {TypeError} - If the response has an incorrect `Content-Type`
 * @returns {Promise<ResponseWrapper|Error>}
 * @see DEFAULT_TIMEOUT
 * @see fetch
 * @see URLSearchParams
 */
export async function request(url, options = {}) {
	const abortController = options.abortController || new AbortController();
	const fetchOptions = buildFetchOptions(options, abortController.signal);
	const timeout = options.timeout !== undefined ? options.timeout : DEFAULT_TIMEOUT;
	let timedOut = false;
	let response,
		responseBody,
		timeoutId;

	if (options.searchParams) {
		url += (url.includes('?') ? '&' : '?') + new URLSearchParams(options.searchParams).toString();
	}

	if (timeout && timeout !== Infinity) {
		timeoutId = setTimeout(() => {
			timedOut = true;
			abortController.abort();
		}, timeout);
	}

	try {
		response = await fetch(url, fetchOptions);

		if (response.status < 500) {
			const contentType = response.headers.get('content-type');

			if (contentType && contentType.match(/application\/[+\w.]*json/)) {
				// Some calls return `Content-Type` `application/json` when there is no content which would cause
				// `response.json()` to error
				const text = await response.text();

				responseBody = text ? JSON.parse(text) : null;
			} else {
				throw new TypeError(getContentTypeErrorMessage(url, contentType));
			}
		} else {
			throw new DOMException(getNetworkErrorMessage(url, response), 'NetworkError');
		}
	} catch (error) {
		if (error.name === 'AbortError') {
			if (timedOut) {
				throw new DOMException(getTimeoutErrorMessage(url, timeout), 'TimeoutError');
			}
		} else {
			throw error;
		}
	} finally {
		clearTimeout(timeoutId);
	}

	return { body: responseBody, response };
}
