import React, { Component } from 'react';

import {
  DubProvider,
  Link,
  Route,
  getCurrentContext,
  onContextChange,
  pathFor,
  routeTo
} from './routes';

class App extends Component {
  constructor (props) {
    super(props);
    onContextChange((context) => {
      console.log('context did change:', context);
    });
  }

  render () {
    const logCurrentContext = () => {
      console.log(getCurrentContext());
    };

    const programaticRoute = () => {
      routeTo('pet.treats', { petId: 'dog-2' });
    };

    return (
      <DubProvider>
        <div className='app'>
          <p><Link to='alpha'>{ pathFor('alpha') }</Link></p>
          <p><Link to='beta'>{ pathFor('beta') }</Link></p>
          <p><Link to='pets'>{ pathFor('pets') }</Link></p>
          <p><Link to='pet' params={ { petId: 'dog-1' } }>{ pathFor('pet', { petId: 'dog-1' }) }</Link></p>
          <p><Link to='pet' params={ { petId: 'dog-2' } }>{ pathFor('pet', { petId: 'dog-2' }) }</Link></p>
          <p><Link to='pet.treats' params={ { petId: 'dog-1' } }>{ pathFor('pet.treats', { petId: 'dog-1' }) }</Link></p>
          <p><Link to='pet.toys' params={ { petId: 'dog-1' } }>{ pathFor('pet.toys', { petId: 'dog-1' }) }</Link></p>

          <Route any>
            { ({ meta }) => {
              if (meta.title) {
                return (
                  <h3>{ meta.title }</h3>
                )
              }
            } }
          </Route>

          <Route is='alpha'>
            <p>alpha is here</p>
          </Route>

          <Route is='beta'>
            <p>beta is here</p>
          </Route>

          <Route not='alpha'>
            <p>NOT alpha</p>
          </Route>

          <Route not={ ['alpha', 'beta'] }>
            <p>NOT alpha or beta</p>
          </Route>

          <Route is={ ['alpha', 'beta'] }>
            <p>IS alpha or beta</p>
          </Route>

          <Route is='pet'>
            { ({ params }) => {
              return (
                <p>pet is here ({ params.petId })</p>
              )
            } }
          </Route>

          <Route is='pet.treats'>
            <p>pet.treats here</p>
          </Route>

          <Route is='pet.toys'>
            <p>pet.toys here</p>
          </Route>

          <Route>
            { (context) => {
              return (<pre>{ JSON.stringify(context, null, 2) }</pre>)
            } }
          </Route>

          <Route unmatched>
            <p>ROUTE IS UNMATCHED</p>
          </Route>

          <button onClick={ logCurrentContext }>Log Current Context</button>
          <button onClick={ programaticRoute }>Invoke Programatic Route</button>
        </div>
      </DubProvider>
    );
  }
}

export default App;
