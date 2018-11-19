Deltasnare ticks are objects with the following properties:

- **`state`**: the state stored in the tick
- **`peers`**: an array of peer IDs connected to the *snare* in the given tick
- **`inputs`**: an object, mapping inputs received from peers to every peer ID
- **`control`**: a control object, set by the server
- **`tick`**: integer, a number that is incremented with each tick
- **`checksum`**: a checksum of all other fields in the tick

## Usage

```javascript
const tick = require('tick')

// initiating from scratch
const newTick = tick({})

// synchronizing a received tick
const synchronized = tick.sync(receivedTick)
```

Ticks can be created in two ways:

- **`tick(state, number = 0)`**: creates a new tick with a given state and numeric ID
- **`tick.sync(received)`**: turns a received object into a tick

Methods are added automatically for convenient usage. They return a new tick instead of modifying an existing object, allowing for chaining and immutability. The available methods are:

- **`setState(state)`**: replaces the state object with a new value
- **`setPeers(peers)`**: replaces the peers array with a new value, synchronizing the inputs object
- **`setInput(peerId, input)`**: adds the input of a specific peer if included in the peers array
- **`setControl(control)`**: replaces the control object
- **`getNext()`**: creates a new, empty state in succession to the old one
- **`calculateChecksum()`**: calculates the checksum for the current tick

Example usage:

```javascript
return tick
  // tick.control said we have two peers, 'foo' and 'bar'
  .setPeers(['foo', 'bar'])
  // received an input object from 'foo'
  .setInput('foo', {throttle: 42})
  // we'd like a checksum on this one
  .calculateChecksum()
```