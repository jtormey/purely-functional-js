/* Simulate a simple backend API */
let { set, view, lensProp, lensIndex, compose } = require('ramda')
let { Future } = require('ramda-fantasy')

let mockBackend = {
  users: [
    { id: 0, name: 'jt' },
    { id: 1, name: 'jaume' },
    { id: 2, name: 'phil' }
  ]
}

// create :: String -> Backend
exports.create = ((backend) => (domain) => ({
  call: (url, data = {}, response) => {
    let userLens = compose(lensProp('users'), lensIndex(data.id))

    if (view(userLens, backend) == null) {
      return response.chain(() => Future.reject('User not found'))
    }

    switch (url) {
      case `${domain}/users`: {
        return response.map(() => backend.users[data.id])
      }
      case `${domain}/users/save`: {
        backend = set(userLens, data, backend)
        return response.map(() => backend.users)
      }
      default: {
        return response.chain(() => Future.reject(`${url} - 404`))
      }
    }
  }
}))(mockBackend)
