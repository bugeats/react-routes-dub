/* eslint-disable no-console */

const routesDub = require('react-routes-dub');

async function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = routesDub({
  log: (...args) => console.log(...['DUB:', ...args])
}, [
  {
    name: 'crates',
    pattern: '/crates',
    meta: { dusty: true },
    onVisit: async () => {
      return sleep(500);
    },
    onVisitAscending: async () => {
      return sleep(500);
    },
    onVisitDescending: async () => {
      return sleep(500);
    },
    routes: [
      {
        name: 'crate',
        pattern: '/:recordName',
        meta: { dusty: false },
        onEnter: async () => {
          console.log('>> enter crate');
          return sleep(2000);
        },
        routes: [
          {
            name: 'play'
          }
        ]
      }
    ]
  },
  {
    name: 'mammal',
    onVisit: () => sleep(500),
    routes: [
      {
        name: 'primate',
        onVisit: () => sleep(500),
        routes: [
          {
            name: 'hominidae',
            onVisit: () => sleep(500)
          },
          {
            name: 'pongidae',
            onVisit: () => sleep(500)
          }
        ]
      },
      {
        name: 'felis',
        onVisit: () => sleep(500),
        routes: [
          {
            name: 'domestica',
            onVisit: () => sleep(500)
          },
          {
            name: 'leo',
            onVisit: () => sleep(500)
          }
        ]
      }
    ]
  },
  // order matters here
  {
    name: 'glob-with-fragment',
    pattern: '/glob:addr(.*)#:fragment(.*)?'
  },
  {
    name: 'glob',
    pattern: '/glob:addr(.*)'
  }
]);
