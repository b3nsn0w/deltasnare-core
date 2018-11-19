Core module of Deltasnare, contains basic tick management and executes the delta function.

# Usage

```javascript
const core = require('@deltasnare/core')

// const delta = function (state, inputs, options) { ... }
// const options = { ... }

const chunk = core(delta, options)

chunk.setControl(1, {
  'deltasnare/peers': ['foo']
})
chunk.setInput(3, 'foo', 'bar')
chunk.setCurrent(4)

chunk.getTick(4)
```

The Deltasnare core is built around the _delta_ function, a simple, repeatable representation of the gamecode. It holds all future and past ticks for a given window size, along with their inputs and control messages. It can be created by calling the exported function

## `core(delta, options)`

with the following parameters:

 - `delta`: Delta function, describes the gamecode
 - `options`: An object, specifiying several parameters to the core. It has the following fields:
   - `environment`: Environment object, it is passed to the delta function.
   - `maskSize`: Number of bits truncated from floating point numbers, used to mask floating point error. Defaults to 4, maximum supported value is 16. Passed to the [normalizer](lib/normalize/README.md).
   - `startingPoint`: ID of first tick, 0 by default.
   - `state`: Initial state at the starting tick. Either this or `sync` must be provided.
   - `sync`: The synchronization data, contains multiple ticks. Either this or `state` must be provided.
   - `windowSize`: Deltasnare window size, defines how many ticks are stored forward and backwards. 128 by default, more details [here](#TODO).

The returned object is the core, with the following methods and properties:

### `getTick(tickID)`

Returns a [tick object](lib/tick/README.md) representing the tick with the given ID. If the requested tick is in the future or older than `windowSize` a RangeError is thrown.

Due to lazy evaluation, this is where the delta function is ran if anything invalidated the currently calculated tick.

### `setInput(tickID, peer, input)`

Sets the input for a given peer and tick. Allowed range is `windowSize` forward and backward from the current tick.

### `setControl(tickID, control)`

Sets the server-defined control message for a specific tick, similarly to `setInput()`

### `setCurrent(tickID)`

Sets the current tickID. Allowed range is `windowSize` forward from current.

### `current`

ID of the current tick. Read-only.

### `environment`

The environment object passed to the delta function.

### `windowSize`

The window size for the current core. Read-only.

# The Delta Function

The delta is the representation of the gamecode. It receives the game state, the peer inputs, and the options, and returns the next state. It must be deterministic, repeatable, across machines. It has the following form:

## `delta(state, inputs, options)`

where the parameters are the following:

### `state`

This is the game state. It is a custom object, entirely user-defined. Must be JSON-serializable, and safe to transmit over the network (although it is only done so on synchronization).

### `inputs`

An object, where the key-value pairs correspond to peerID and the input of the given peer. Inputs are user-defined, although the same restrictions apply as on the state.

### `options`

An object, containing the following fields:

- `control`: control variable from the server. User defined, with the same restrictions as on state.
- `environment`: the environment variables passed to the delta
- `previous`: the full previous tick, in case it's required
- `seed`: a seed that is derived from an earlier tick, it is safe to use for pseudorandom operations
- `tickId`: the ID of the current tick
