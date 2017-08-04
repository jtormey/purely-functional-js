/* Simulate built-in io functions */
let fs = require('fs')
let path = require('path')
let { IO } = require('ramda-fantasy')
let { syslog } = require('./_util')

// trace :: String -> IO ()
exports.trace = (str) => IO(() => {
  syslog('out', str)
})

// readFile :: String -> IO ()
exports.readFile = (file) => IO(() => {
  let fullPath = path.join(__dirname, file)
  syslog('fs', fullPath)
  return fs.readFileSync(fullPath).toString()
})

// runFuture :: Future a b -> IO ()
exports.runFuture = (future) => IO(() => future.fork(
  error => console.log('ERROR:', error),
  value => console.log(value)
))
