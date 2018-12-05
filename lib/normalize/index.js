// removes the maskSize least significant bits in the float
const normalizeFloat = (maskSize = 4) => {
  const mask = -Math.pow(2, maskSize) // 11111100
  const cloneMask = ~mask << maskSize // 00001100
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)

  return float => {
    view.setFloat64(0, float, false) //               12345678
    const masked = view.getUint32(4, false) & mask // 12345600
    const patch = (masked & cloneMask) >> maskSize //       56
    view.setUint32(4, masked | patch, false) //       12345656
    return view.getFloat64(0, false)
  }
}

const mapObject = (object, fn) => {
  return Object.keys(object).reduce((acc, key) => {
    acc[key] = fn(object[key], key, object)
    return acc
  }, {})
}

const normalizer = (maskSize = 4) => {
  if (maskSize > 16) throw new RangeError('Maximum mask size is 16')

  const maxSafeInteger = Math.floor(Number.MAX_SAFE_INTEGER / Math.pow(2, maskSize))
  const floatNormalizer = normalizeFloat(maskSize)

  const normalize = value => {
    if (value == null) return value

    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      return Array.from(value).map(v => normalize(v))
    }

    switch (typeof value) {
      case 'number': return floatNormalizer(value)
      case 'object': return mapObject(value, v => normalize(v))
      default: return value
    }
  }

  return {
    normalize,
    maskSize,
    maxSafeInteger
  }
}

module.exports = normalizer
