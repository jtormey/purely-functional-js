# Purely Functional JS

Simulating a purely functional language in Javascript

## Install

`yarn install`

## Program

A simple program that uses monads to encase all side effects. It exports an `IO`, which is ran inside `index.js` (shortcut: `yarn start`).

1. Read a file (IO)
2. Parse as json (Either)
3. Use as env (Reader)
4. Call api with url in env (Future)

## Builtin

Built-in functions that perform side effects on behalf of the program.

### io

Simulate basic IO actions

* `trace :: String -> IO ()`

* `readFile :: String -> IO ()`

* `runFuture :: Future a b -> IO ()`

### http

Simulate calling a simple mock backend

* `request :: String -> Object -> Future String a`

### string

* `parseJson :: String -> Either String Object`
