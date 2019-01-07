/* eslint-disable no-console */

const routesDub = require('react-routes-dub');

module.exports = routesDub([
  {
    name: 'alpha',
    pattern: '/alpha',
    meta: {
      title: 'Title for Alpha'
    }
  },
  {
    name: 'beta',
    pattern: '/beta',
    meta: {
      title: 'Title for Beta'
    },
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
    meta: {
      title: 'Title for Any Pet'
    },
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
