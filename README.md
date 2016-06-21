# Impequid API

A JavaScript/Node.js API to easily interact with Impequid.

Works best with WebPack or Node.js.

## default class ImpequidAPI ({token, server='impequid.com', port=443, secure=true, debug=false})

Completely Promise-based, making it easy to interact with it, especially using `yield` and `await`.

````javascript
import ImpequidAPI from 'impequid-api';
const iqa = new ImpequidAPI({token});
````

The following API method examples assume the above code is present.

In addition to that, they also omit this:
````javascript
.catch(error => {
	console.error('something went wrong', error);
});
````

If you want or need error handling, you should definitely not omit that code.

### verify [+](documentation/verify.md) [`none`]

````javascript
iqa.verify().then({isValid, userId} => {
	console.log(`Token is ${isValid ? '' : 'not '}valid`);
});
````

### getUser [+](documentation/users.md) [`user.id`, `user.name`]

Beware that **usernames may change**. If you want to store information about a user, store it using the `userId` and `impequidServer`.

Depending on your permissions you may get less information.

````javascript
iqa.getUser().then(user => {
	// Object user
	// String user.name [user.name]
	// String user.id [user.id] (usually convertable to Mongo's ObjectId)
});
````

### getBackgroundToken [+](documentation/tokens.md) [`any:background`]

Fetch a background-access token from the server. This token can be used until the user revokes it and never gets IP-blocked.

The permission scope of a background-access token is completely separate from a client-access token.

For example: if you want to notify users about changes in the background, you should request the `background.notify` permission.

**Tip:** You can easily spot a background token, because it begins with the letter `d`, while the normal token begins with a `n`.

````javascript
iqa.getBackgroundToken().then(token => {
	// String token
	// you may switch to the background token
	iqa.token = token;
});
````

### get/set token [+](documentation/tokens.md) [`none`]

Gets or sets the used token. Useful if you want to switch to a background-token or if you want to use one `ImpequidAPI` instance for multiple users.

````javascript
iqa.token = token;
console.log(iqa.token);
````

### notify (Object options) [+](documentation/notify.md) [`notify`]

Sends a notification to the user.

````javascript
iqa.notify({
	message: 'Something you want the user to know',
	priority: -1, // low = -1, normal = 0, high = 1
	url: 'https://:appServer/api/redirect/:someToken'
	// You can use the above URL to instantly trigger an action when the user clicks the link
}).then(() => {
	// it worked
});
````

### getPermissions [+](documentation/permissions.md) [`none`]

Retrieves all permissions associated to the token.

````javascript
iqa.getPermissions().then(permissions => {
	// Object permissions
	// Example:
	//	{
	//		notify: true,
	//		user: {
	//			id: true
	//		},
	//		background: true
	//	}
	// note that `user: true` also grants user.id
	// see exported function hasPermission to easily check
	// for a particular permission
});
````

### requestPermissions [+](documentation/permissions.md) [`none`]

Allows you to request new permissions. If you set a permission to `false` it will get disabled for your app.

The following example will request `user.name` permissions for the normal and background tokens. It will also disable the `background.notify` permission.

When requesting permissions, it's recommended to be as specific as possible, since you will otherwise get unnecessary permissions and users are more likely to decline your request.

````javascript
iqa.requestPermissions({
	user: {
		name: true
	},
	background: {
		user: {
			name: true,
			id: true
		},
		notify: false
	}
})
````

### isBackground [+](documentation/tokens.md) [`none`]

````javascript
const isBackground = iqa.isBackground();
console.log(`API is ${isBackground ? '' : 'not '}running in background mode.`).
````

## class ServiceProvider ({server='services.impequid.com', cacheDuration=60000, secure=true, port=443, debug=false})

````javascript
import {ServiceProvider} from 'impequid-api';
const isp = new ServiceProvider();
isp.get('dns.smartfl.at').then(service => {
	console.log(service);
}).catch(error => {
	console.error('could not fetch service data');
});
````
