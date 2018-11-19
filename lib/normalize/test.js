const normalizer = require('.')

const n = normalizer()

console.log(n.normalize({ a: 0.1 + 0.2, b: 0.3 }))
