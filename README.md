<a name="module_comms"></a>

## comms
Simple `fetch` wrapper for JSON based requests.

**Author**: Ben Worthington
**License**: MIT

* [comms](#module_comms)
    * _static_
        * [.request(url, [options])](#module_comms.request) ⇒ <code>Promise.&lt;(ResponseWrapper\|Error)&gt;</code>
    * _inner_
        * [~DEFAULT_TIMEOUT](#module_comms..DEFAULT_TIMEOUT) : <code>number</code>
        * [~ResponseWrapper](#module_comms..ResponseWrapper) : <code>Object</code>
        * [~fetch](#external_fetch)
        * [~URLSearchParams](#external_URLSearchParams)

<a name="module_comms.request"></a>

### comms.request(url, [options]) ⇒ <code>Promise.&lt;(ResponseWrapper\|Error)&gt;</code>
Simple `fetch` wrapper for JSON based requests.
- Provides timeout functionality
- Unlike `fetch` errors on a response status >= 500
- Does not error on `AbortController` `abort()`, simply returns `undefined` response body and `Response` object

**Kind**: static method of [<code>comms</code>](#module_comms)
**Throws**:

- <code>NetworkError</code> - If the response status is 500 or above
- <code>TimeoutError</code> - If the request reaches the timeout limit
- <code>TypeError</code> - If the specified URL string includes user credentials, see [fetch](fetch)
- <code>TypeError</code> - If the `fetch` fails (connection refused)
- <code>TypeError</code> - If the response has an incorrect `Content-Type`

**See**

- DEFAULT_TIMEOUT
- fetch
- URLSearchParams


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | URL of the resource to request |
| [options] | <code>Object</code> | An object containing any `fetch` settings plus additional settings detailed below |
| [options.abortController] | <code>AbortController</code> | An `AbortController` object instance to abort the request,     this is the preferred way to use an `AbortController`, if an `AbortController` `signal` is passed in the     `options` then this will be overwritten |
| [options.jsonBody] | <code>Object</code> | The request body as an object which can be converted to a `string` via     `JSON.stringify()`, will overwrite any `options.body` |
| [options.searchParams] | <code>Object</code> | Any value accepted by URLSearchParams constructor which will be appended to     the request URL |
| [options.timeout] | <code>number</code> | The request timeout in milliseconds, if not supplied it defaults to     `DEFAULT_TIMEOUT`, if `0` or `Infinity` are provided then the request will not timeout |

<a name="module_comms..DEFAULT_TIMEOUT"></a>

### comms~DEFAULT\_TIMEOUT : <code>number</code>
Default timeout in milliseconds.

**Kind**: inner constant of [<code>comms</code>](#module_comms)
<a name="module_comms..ResponseWrapper"></a>

### comms~ResponseWrapper : <code>Object</code>
**Kind**: inner typedef of [<code>comms</code>](#module_comms)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [body] | <code>Object</code> | The parsed `Response` stream |
| [response] | <code>Response</code> | The `Response` object |

<a name="external_fetch"></a>

### comms~fetch
Global method for fetching a resource from the network.

**Kind**: inner external of [<code>comms</code>](#module_comms)
**See**: [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
<a name="external_URLSearchParams"></a>

### comms~URLSearchParams
Global object containing utility methods to work with the query string of a URL.

**Kind**: inner external of [<code>comms</code>](#module_comms)
**See**: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
