/* Simulate built-in functions */
let fs = require('fs')
let env = require('./env')
let { set, view, lensProp, lensIndex, compose } = require('ramda')
let { IO, Future, Either } = require('ramda-fantasy')

let mockDomain = env.apiUrl

let mockBackend = {
  users: [
    { id: 0, name: 'jt' },
    { id: 1, name: 'jaume' },
    { id: 2, name: 'phil' }
  ]
}

let syslog = (name, log) => console.log('>> system.' + name, `"${log}"`)

// trace :: String -> IO ()
exports.trace = (str) => IO(() => {
  syslog('out', str)
})

// readFile :: String -> IO ()
exports.readFile = (path) => IO(() => {
  syslog('fs', path)
  return fs.readFileSync(path).toString()
})

// runFuture :: Future a b -> IO ()
exports.runFuture = (future) => IO(() => future.fork(
  error => console.log('ERROR:', error),
  value => console.log(value)
))

// parseJson :: String -> Either String Object
exports.parseJson = (json) => {
  try {
    return Either.of(JSON.parse(json))
  } catch (e) {
    return Either.Left(e.message)
  }
}

// delay :: Int -> Future a b
exports.delay = (time) => Future((_, resolve) => setTimeout(resolve, time))

// request :: String -> Object -> Future String a
exports.request = ((backend) => (url, data = {}) => {
  syslog('http', url)

  let response = exports.delay(500)
  let userLens = compose(lensProp('users'), lensIndex(data.id))

  if (view(userLens, backend) == null) {
    return response.chain(() => Future.reject('User not found'))
  }

  switch (url) {
    case `${mockDomain}/users`: {
      return response.map(() => backend.users[data.id])
    }
    case `${mockDomain}/users/save`: {
      backend = set(userLens, data, backend)
      return response.map(() => backend.users)
    }
    default: {
      return response.chain(() => Future.reject(`${url} - 404`))
    }
  }
})(mockBackend)
