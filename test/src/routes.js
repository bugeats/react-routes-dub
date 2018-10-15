/* eslint-disable no-console */

const routesDub = require('react-routes-dub');

module.exports = routesDub([
  {
    name: 'alpha',
    pattern: '/alpha'
  },
  {
    name: 'beta',
    pattern: '/beta',
    onEnter: () => {
      console.log('onEnter beta');
    }
  },
  {
    name: 'pets',
    pattern: '/pets'
  },
  {
    name: 'pet',
    pattern: 'pets/:petId',
    onEnter: ({ params }) => {
      console.log(`onEnter pets, petId: ${ params.petId }`);
    },
    routes: [
      {
        name: 'treats',
        pattern: 'treats'
      },
      {
        name: 'toys',
        pattern: 'toys'
      }
    ]
  }
]);
