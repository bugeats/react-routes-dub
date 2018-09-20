# react-routes-dub

Stupid-easy React routing for the browser in 200 lines of code and with a single dependency.

That single dependency is important. [path-to-regexp](https://github.com/pillarjs/path-to-regexp) is used by Express to parse path strings, and now you can use it for your client-side routes.

- All configuration takes place in a single file.
- Uses the [React Context API](https://reactjs.org/docs/context.html) for minimum fuss.
- Routes are **named**, as they should be.


# Installation

    yarn add react-routes-dub


# Usage

[![Edit react-routes-dub-demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/2vr2ojv8n0)

Define your routes with a single file:

```javascript
// routes.js

const React = require('react'); 
const routesDub = require('react-routes-dub');

module.exports = routesDub({
  React
}, [
  {
    name: 'home',
    pattern: '/'
  },
  {
    name: 'pet',
    pattern: 'pets/:petId',
    routes: [
      {
        name: 'toys',
        pattern: 'toys'
      }
    ]
  }
]);

```

Now everything you need to begin routing is immediately available.

```jsx
// app.jsx

import React, { Component } from 'react';
import { DubProvider, Link, Route } from './routes';

class App extends Component {
  render () {
    return (
      <DubProvider>
        <Link to='home'>Home</Link>
        <Link to='pet' params={ { petId: 'dog-1' } }>See Dog One</Link>
        <Link to='pet' params={ { petId: 'dog-2' } }>See Dog Two</Link>
        <Link to='pet.toys' params={ { petId: 'dog-1' } }>See Dog One's Toys</Link>
        <Route is='home'>
          <p>Welcome home.</p>
        </Route>
        <Route is='pet'>
          { ({ params }) => {
            // route parameters are available here
            return (
              <p>Pet ID here: { params.petId }</p>
            )
          } }
        </Route>
        <Route is='pet.toys'>
          <p>Pet Toys!</p>
        </Route>
      </DubProvider>
    );
  }
}
```

That's it! You're done.

**See [./test](./test) for more.**
