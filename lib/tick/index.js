const crypto = require('crypto')
const stringify = require('json-stable-stringify')

const setState = (tick, state) => {
  return addMethods({ ...tick, state })
}

const setPeers = (tick, peers) => {
  const inputs = peers
    .reduce((acc, peerId) => {
      acc[peerId] = tick.inputs[peerId] || null
      return acc
    }, {})

  return addMethods({ ...tick, peers, inputs })
}

const setInput = (tick, peer, input) => {
  if (!~tick.peers.indexOf(peer)) return addMethods({ ...tick })
  return addMethods({ ...tick, inputs: { ...tick.inputs, [peer]: input } })
}

const setControl = (tick, control) => {
  return addMethods({ ...tick, control })
}

const getNext = (tick) => {
  return addMethods({
    state: null,
    peers: tick.peers,
    inputs: tick.peers.reduce((acc, peerId) => {
      acc[peerId] = null
      return acc
    }, {}),
    control: null,
    tick: tick.tick + 1,
    checksum: null
  })
}

const calculateChecksum = (tick) => {
  const temp = { ...tick }
  delete temp.checksum

  return addMethods({
    ...tick,
    checksum: crypto
      .createHash('sha256')
      .update(stringify(temp))
      .digest('hex')
  })
}

const addMethods = (tick) => {
  return {
    ...tick,
    setState: setState.bind(null, tick),
    setPeers: setPeers.bind(null, tick),
    setInput: setInput.bind(null, tick),
    setControl: setControl.bind(null, tick),
    getNext: getNext.bind(null, tick),
    calculateChecksum: calculateChecksum.bind(null, tick)
  }
}

const init = (state, number = 0) => {
  return addMethods({
    state,
    peers: [],
    inputs: {},
    control: null,
    tick: number,
    checksum: null
  })
}

const sync = (tick) => {
  return addMethods(tick)
}

module.exports = init
module.exports.sync = sync
