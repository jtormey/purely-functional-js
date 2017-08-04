/* Simulate built-in string functions */
let { Either } = require('ramda-fantasy')

// parseJson :: String -> Either String Object
exports.parseJson = (json) => {
  try {
    return Either.of(JSON.parse(json))
  } catch (e) {
    return Either.Left(e.message)
  }
}
