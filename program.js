let fs = require('fs')
let { map, lensProp, lensIndex, set, range, traverse } = require('ramda')
let { IO, Either, Reader, Future } = require('ramda-fantasy')
let ReaderTFuture = Reader.T(Future)

let users = [
  { id: 0, name: 'jt' },
  { id: 1, name: 'jaume' },
  { id: 2, name: 'phil' }
]

/* PLAN
    1. read a file (IO)
    2. parse as json (Either)
    3. use as env (Reader)
    4. url to call api (Future)
*/

let loadEnv = (env) => IO(() => fs.readFileSync(env).toString())
let consoleError = (data) => IO(() => console.error(data))
let error = (e) => { throw new Error(e) }

let runFuture = (future) => IO(() => future.fork(
  error => process.stderr.write('ERROR: ' + error + '\n'),
  value => process.stdout.write(value + '\n')
))

let tryEither = (f, ...args) => {
  try {
    let result = f.apply(f, args)
    return Either.of(result)
  } catch (e) {
    return Either.Left(e.message)
  }
}

// callUsersApi :: ([User] -> a) -> ReaderT Env (Future String) a
let callUsersApi = (f) => ReaderTFuture(env => Future((reject, resolve) => {
  console.log('calling api:', env.apiUrl)
  setTimeout(() => tryEither(f, users).either(reject, resolve), 500)
}))

// fetchUser :: Int -> ReaderT Env (Future String) User
let fetchUser = (id) => callUsersApi(users => users[id])

// saveUser :: User -> ReaderT Env (Future String) [User]
let saveUser = (user) => callUsersApi(users => users[user.id] == null
  ? error('User not found')
  : set(lensIndex(user.id), user, users)
)

// main :: () -> ReaderT Env (Future String) String
let main = () => (
  traverse(ReaderTFuture.of, fetchUser, range(0, 2)).chain(xs =>
    saveUser(set(lensProp('name'), 'changed', xs[1]))
  ).map(users =>
    JSON.stringify(users, null, 2)
  )
)

let program = loadEnv('./env.json')
  .map(env => tryEither(JSON.parse, env))
  .map(map(env => main().run(env)))
  .chain(program => program.either(consoleError, runFuture))

module.exports = program
