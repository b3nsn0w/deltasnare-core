const tick = require('./tick')
const normalize = require('./normalize')

const core = (delta, options = {}) => {
  const ticks = {}
  const tickState = {
    oldest: null,
    newest: null,
    current: null,
    upToDate: null,
    startingPoint: null
  }
  const windowSize = options.windowSize || 128

  // add the initial tick(s)
  if (options.sync) { // received ticks on synchronization
    const receivedTicks = options.sync.ticks

    Object.keys(receivedTicks).map(tickId => {
      ticks[tickId] = tick.sync(receivedTicks[tickId])
    })

    tickState.current = options.sync.current
    tickState.oldest = options.sync.oldest
    tickState.startingPoint = options.sync.startingPoint

    if (tickState.oldest > tickState.current - windowSize * 2 && tickState.oldest !== tickState.startingPoint) {
      throw new RangeError(`Insufficient tick range (${
        `got ${tickState.oldest}-${tickState.current}, needs ${tickState.current - windowSize * 2}-${tickState.current}`
      })`)
    }
  } else if (options.state) { // received initial tick
    const startingPoint = options.startingPoint || 0
    const firstTick = tick(options.state, startingPoint)
    ticks[firstTick.tick] = firstTick

    tickState.current = firstTick.tick
    tickState.oldest = firstTick.tick
    tickState.startingPoint = startingPoint
  } else {
    throw new TypeError('Either a synchronization point or a starting tick is required')
  }

  tickState.newest = tickState.current
  tickState.upToDate = tickState.current

  // for removing old ticks later
  const cleanup = () => {
    Object.keys(ticks).map(tickId => {
      if (tickId > tickState.newest || tickId < tickState.oldest) delete ticks[tickId]
    })
  }

  // stretch ticks to match the window size
  const stretch = () => {
    const max = tickState.current + windowSize

    while (tickState.newest < max) {
      ticks[tickState.newest + 1] = ticks[tickState.newest].getNext()
      tickState.newest += 1
    }
  }

  stretch()

  // create normalizer and the environment
  const normalizer = normalize(options.maskSize)

  const environment = {
    ...(options.environment || {}),
    windowSize,
    maskSize: normalizer.maskSize,
    maxSafeInteger: normalizer.maxSafeInteger
  }

  // advance to a tick from the previous one, this is where the magic happens
  const advance = (tickId) => {
    const current = ticks[tickId]
    const previous = ticks[tickId - 1]

    const seedTickIndex = tickState.oldest === tickState.startingPoint ? tickState.startingPoint : tickId - windowSize
    ticks[seedTickIndex] = ticks[seedTickIndex].calculateChecksum()

    const seedTick = ticks[seedTickIndex]
    const seed = seedTick ? seedTick.checksum || null : null

    const state = delta(previous.state, previous.inputs, {
      previous,
      tickId,
      seed,
      environment,
      control: previous.control
    })

    const normalized = normalizer.normalize(state)
    ticks[tickId] = current.setState(normalized)
  }

  const advanceUntil = (tickId) => {
    const target = Math.min(tickId, tickState.current)

    while (tickState.upToDate < target) {
      tickState.upToDate += 1
      advance(tickState.upToDate)
    }
  }

  // utility functions for interface
  const checkRange = (tickId, forward = false, disallowBackward = false) => {
    const upper = forward ? tickState.current + windowSize : tickState.current
    const lower = disallowBackward ? tickState.current : tickState.current - windowSize
    if (tickId > upper || tickId < lower) {
      throw new RangeError(`Requested tick is out of range (req: ${tickId}, range: ${lower}-${upper})`)
    }
  }

  const recalculateFrom = (tickId) => {
    tickState.upToDate = Math.min(tickState.upToDate, tickId) // lazy code and lazy evaluation at once
  }

  // interface functions
  const setCurrent = (tickId) => {
    checkRange(tickId, true)
    tickState.current = tickId

    // add new ticks
    stretch()

    // remove unneeded old ticks
    tickState.oldest = Math.max(tickState.oldest, tickId - windowSize * 2)
    cleanup()
  }

  const getTick = (tickId) => {
    checkRange(tickId)

    advanceUntil(tickId)
    return ticks[tickId]
  }

  const setInput = (tickId, peer, input) => {
    checkRange(tickId, true)
    ticks[tickId] = ticks[tickId].setInput(peer, input)
    recalculateFrom(tickId)
  }

  const setControl = (tickId, control) => {
    checkRange(tickId, true)
    ticks[tickId] = ticks[tickId].setControl(control)
    recalculateFrom(tickId)

    if (control['deltasnare/peers']) {
      ticks[tickId] = ticks[tickId].setPeers(control['deltasnare/peers'])
      for (let current = tickId + 1; current <= tickState.newest && !(ticks[current].control && ticks[current].control['deltasnare/peers']); current++) {
        ticks[current] = ticks[current].setPeers(ticks[current - 1].peers)
      }
    }
  }

  return {
    getTick,
    setControl,
    setInput,
    setCurrent,
    get current () {
      return tickState.current
    },
    environment,
    windowSize
  }
}

module.exports = core
