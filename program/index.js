let { map, lensProp, set, range, traverse } = require('ramda')
let { Reader, Future } = require('ramda-fantasy')

let { trace, readFile, runFuture } = require('../builtin/io')
let { request } = require('../builtin/http')
let { parseJson } = require('../builtin/string')

let ReaderTFuture = Reader.T(Future)

// callApi :: String -> Object -> ReaderT Env (Future String) a
let callApi = (endpoint, data) => ReaderTFuture(env =>
  request(env.apiUrl + endpoint, data)
)

// fetchUser :: Int -> ReaderT Env (Future String) User
let fetchUser = (id) => callApi('/users', { id })

// saveUser :: User -> ReaderT Env (Future String) [User]
let saveUser = (user) => callApi('/users/save', user)

// main :: () -> ReaderT Env (Future String) String
let main = () => (
  traverse(ReaderTFuture.of, fetchUser, range(0, 2)).chain(xs =>
    saveUser(set(lensProp('name'), 'changed', xs[1]))
  ).map(users =>
    JSON.stringify(users, null, 2)
  )
)

// program :: IO ()
let program = readFile('../env.json')
  .map(parseJson)
  .map(map(env => main().run(env)))
  .chain(program => program.either(trace, runFuture))

module.exports = program
