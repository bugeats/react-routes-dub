const routesDub = require('react-routes-dub');

module.exports = routesDub([
  {
    name: 'alpha',
    pattern: '/alpha'
  },
  {
    name: 'beta',
    pattern: '/beta'
  },
  {
    name: 'pet',
    pattern: 'pets/:petId',
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
