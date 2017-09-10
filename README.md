# Isograte 
[![Build Status](https://travis-ci.org/doshisid/isograte.svg?branch=master)](https://travis-ci.org/doshisid/isograte)

Isolate functions that are only meant to run in production environment. Integrate them back while testing.

There are some pieces of code that you only want to run while in the production environment. For eg: a function that sends out emails, or code that makes an HTTP request. We don't want to run those functions while developing or testing. 

But we still need to test those functions. Isograte helps to make sure that isolated code only runs when its meant to.

### Install

```bash
yarn add isograte

# or with NPM
npm install --save isograte

```

### Usage

#### Isolate

Isolate those functions that you don't want to be running on development or test environment. The isolated function will only run if `process.env.NODE_ENV` is set to `production` or we explicitly ask it to run while testing (See Integrate).

```js
import { isolate } from 'isograte'

const sendMail = () => {
  // some code that sends an email
}

// export the isolated function
export default isolate(sendMail)

```

The exported function is now isolated. If the isolated function is called on environments other than `production`, it will just return `null`. You can set the return value when isolating the function. To do that just pass the return value as the second argument to the isolate.

```js

import { isolate } from 'isograte'

const sendMail = () => {
  // some code that sends an email
}

// We can set the return value
export default isolate(sendMail, "Can't send mail in dev env")

```


But we still need to run this code while testing after we have properly mocked everything. To do that we need to integrate it back.

In sendMail.test.js :
```js
import { integrate } from 'isograte'

// import the isolated sendMail
import { sendMail } from './sendMail'


const mail = {
  // the mail object
}

// we have not yet integrated sendMail.
// It returns null if we are not in production and
// it never calls the original sendMail function.
console.log(sendMail(mail))

// integrate takes an isolated function and
// integrates it back.
// if we invoke integrated function, original
// sendMail will be called.
const _sendMail = integrate(sendMail)
_sendMail(mail)

```


Note that the function you integrate might be calling other isolated functions. Those functions will still remain isolated and only the function you integrated will be invoked.

---

Why not just use `process.env.NODE_ENV` directly?

Let's say you want to test an impure function. You mock everything, You set `process.env.NODE_ENV` to `production` and run that code. But there might be other tests running at the same time which expects `NODE_ENV` to be `test`. So the code that was not meant to run gets fired. Your function might also call other impure functions. And to test just one function, you need to mock all the functions to get expected results. With Isograte, You can rest assured that the only functions that runs are the ones that you explicitly integrate. 