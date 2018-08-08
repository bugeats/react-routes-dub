import React, { Component } from 'react';

import { Link, pathFor, Route, DubProvider } from './routes';

class App extends Component {
  render () {
    return (
      <DubProvider>
        <div className='app'>
          <p><Link to='alpha'>{ pathFor('alpha') }</Link></p>
          <p><Link to='beta'>{ pathFor('beta') }</Link></p>
          <p><Link to='pet' params={ { petId: 'dog-1' } }>{ pathFor('pet', { petId: 'dog-1' }) }</Link></p>
          <p><Link to='pet' params={ { petId: 'dog-2' } }>{ pathFor('pet', { petId: 'dog-2' }) }</Link></p>
          <p><Link to='pet.treats' params={ { petId: 'dog-1' } }>{ pathFor('pet.treats', { petId: 'dog-1' }) }</Link></p>
          <p><Link to='pet.toys' params={ { petId: 'dog-1' } }>{ pathFor('pet.toys', { petId: 'dog-1' }) }</Link></p>

          <Route is='alpha'>
            <p>alpha is here</p>
          </Route>

          <Route is='beta'>
            <p>beta is here</p>
          </Route>

          <Route is='pet'>
            <p>pet is here</p>
          </Route>

          <Route is='pet.treats'>
            <p>pet.treats here</p>
          </Route>

          <Route is='pet.toys'>
            <p>pet.toys here</p>
          </Route>

          <Route is='pet'>
            { (obj) => {
              return (<pre>{ JSON.stringify(obj, null, 2) }</pre>)
            } }
          </Route>
        </div>
      </DubProvider>
    );
  }
}

export default App;
