/* Simulate built-in functions */
let fs = require('fs')
let env = require('./env')
let { IO, Future, Either } = require('ramda-fantasy')
let backend = require('./backend')

let mockBackend = backend.create(env.apiUrl)

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
exports.request = (url, data = {}) => {
  syslog('http', url)
  let response = exports.delay(500)
  return mockBackend.call(url, data, response)
}
