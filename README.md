# wattbox
![npm](https://img.shields.io/npm/v/wattbox?style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/JTF4/wattbox/Style%20Check?label=Style%20Check&logo=github&style=flat-square)
[![License](https://img.shields.io/github/license/JTF4/wattbox?style=flat-square)](https://github.com/JTF4/wattbox/blob/master/LICENSE.md)

Promise based node implementation of the WattBox control API

# Installing

Using NPM:
```bash
npm install wattbox
```

Using Yarn:
```bash
yarn add wattbox
```

# Example

Turn on an outlet on the WattBox
```js
import { WattBoxPromise } from 'wattbox';

var wattbox = new WattBoxPromise('username', 'password', '192.168.1.25');

wattbox.powerOn(2).catch((err) => {
    console.log(err);
});
```

Reset an outlet with a custom period of time
```js
import { WattBoxPromise } from 'wattbox';

var wattbox = new WattBoxPromise('username', 'password', '192.168.1.25');

// Turns the outlet off, waits for 5 seconds, then turns the outlet back on
wattbox.powerResetTimeout(2, 5000).catch((err) => {
    console.log(err);
});
```

Subscribe to status updates from the WattBox
```js
import { WattBoxPromise } from 'wattbox';

var wattbox = new WattBoxPromise('username', 'password', '192.168.1.25');

wattbox.subscribeStatus(5000);

wattbox.on('status', (status) => {
    console.log(status);
});

wattbox.on('error', (error) => {
    console.log(error);
});
```

# Methods

Power on the selected outlet:
```js
wattbox.powerOn(<outlet>)
```

Power off the selected outlet:
```js
wattbox.powerOff(<outlet>)
```

Power cycle the selected outlet:
```js
wattbox.powerReset(<outlet>)
```

Power cycle the outlet with a custom period of time:
```js
wattbox.powerResetTimeout(<outlet>, <time>)
```

Enable auto reboot:
```js
wattbox.autoRebootOn()
```

Disable auto reboot:
```js
wattbox.autoRebootOff()
```

Get info about the wattbox. Returns a JSON object containing device info:
```js
wattbox.getInfo()
``` 

Subscribe to device status updates. Returns a JSON object containing the device status:
```js
wattbox.subscribeStatus(<time>)
```

Receive the status and errors thusly:
```js
wattbox.on('status', (status) => {
    console.log(status)
})

wattbox.on('error', (error) => {
    console.log(error)
})
```

Unsubscribe from status updates:
```js
wattbox.unsubscribeStatus()
```

# Issues and Feature Requests
Please open an issue on the [GitHub page](https://github.com/jtf4/wattbox)

This project is licensed under the [MIT](https://github.com/JTF4/wattbox/blob/master/LICENSE.md) license
