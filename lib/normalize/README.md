To combat floating point indeterminism, Deltasnare utilizes a normalizer that rounds floats to an acceptable level of precision without sacrificing the deterministic nature of the delta function.

## Usage

```javascript
const normalize = require('normalizer')

// create a normalizer
const normalizer = normalize()

// now you can use it
normalizer.normalize({hello: 0.3, world: 0.1 + 0.2})
```

The normalizer can be created by calling the exported function:

**`normalize(maskSize = 4)`**

where `maskSize` is the number of bits the normalizer removes from floating point numbers. This can be set between 0 and 16, we recommend keeping this value as low as possible. For complex delta functions, raising this value may help avoid desyncs.

The return value is a normalizer object, with the following properties:

- **`normalize(value)`**: normalizes the given value. This also strips custom object and array types.
- **`maskSize`**: read-only, shows the mask size of the normalizer
- **`maxSafeInteger`**: the largest integer that stays precise with the current normalizer