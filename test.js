const core = require('.')

const chunk = core((state, inputs) => {
  return { increment: state.increment + 1, inputs }
}, {
  state: { increment: 0 }
})

chunk.setControl(1, {
  'deltasnare/peers': ['foo']
})
chunk.setInput(3, 'foo', 'bar')
chunk.setCurrent(4)

console.log(chunk.getTick(4))
