/* Simulate built-in http function to a simple backend API */
let { set, view, lensProp, lensIndex, compose } = require('ramda')
let { Future } = require('ramda-fantasy')
let { syslog } = require('./_util')
let domain = 'https://api.com'

let mockBackend = {
  users: [
    { id: 0, name: 'jt' },
    { id: 1, name: 'jaume' },
    { id: 2, name: 'phil' }
  ]
}

// delay :: Int -> Future a b
let delay = (time) => Future((_, resolve) => setTimeout(resolve, time))

// request :: String -> Object -> Future String a
exports.request = ((backend) => (url, data = {}) => {
  syslog('http', url)

  let response = delay(500)
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
})(mockBackend)
