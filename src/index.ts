import { concat } from 'uint8arrays'

type Appendable = Uint8ArrayList | Uint8Array

function findBufAndOffset (bufs: Uint8Array[], index: number, totalLength: number) {
  if (index == null || index < 0 || index >= totalLength) {
    throw new RangeError('index is out of bounds')
  }

  let offset = 0

  for (const buf of bufs) {
    const bufEnd = offset + buf.byteLength

    if (index < bufEnd) {
      return {
        buf,
        index: index - offset
      }
    }

    offset = bufEnd
  }

  throw new RangeError('index is out of bounds')
}

export class Uint8ArrayList implements Iterable<Uint8Array> {
  private bufs: Uint8Array[]
  public length: number

  constructor (...data: Appendable[]) {
    this.bufs = []
    this.length = 0

    this.appendAll(data)
  }

  * [Symbol.iterator] () {
    yield * this.bufs
  }

  get byteLength () {
    return this.length
  }

  /**
   * Add one or more `bufs` to this Uint8ArrayList
   */
  append (...bufs: Appendable[]) {
    this.appendAll(bufs)
  }

  /**
   * Add all `bufs` to this Uint8ArrayList
   */
  appendAll (bufs: Appendable[]) {
    let length = 0

    for (const buf of bufs) {
      if (buf instanceof Uint8Array) {
        length += buf.byteLength
        this.bufs.push(buf)
      } else {
        length += buf.length
        this.bufs = this.bufs.concat(buf.bufs)
      }
    }

    this.length += length
  }

  /**
   * Read the value at `index`
   */
  get (index: number) {
    const res = findBufAndOffset(this.bufs, index, this.length)

    return res.buf[res.index]
  }

  /**
   * Set the value at `index` to `value`
   */
  set (index: number, value: number) {
    const res = findBufAndOffset(this.bufs, index, this.length)

    res.buf[res.index] = value
  }

  /**
   * Copy bytes from `buf` to the index specified by `offset`
   */
  write (buf: Appendable, offset: number = 0) {
    if (buf instanceof Uint8Array) {
      for (let i = 0; i < buf.length; i++) {
        this.set(offset + i, buf[i])
      }
    } else {
      for (let i = 0; i < buf.length; i++) {
        this.set(offset + i, buf.get(i))
      }
    }
  }

  /**
   * Remove bytes from the front of the pool
   */
  consume (bytes: number) {
    // first, normalize the argument, in accordance with how Buffer does it
    bytes = Math.trunc(bytes)

    // do nothing if not a positive number
    if (Number.isNaN(bytes) || bytes <= 0) {
      return
    }

    while (this.bufs.length > 0) {
      if (bytes >= this.bufs[0].byteLength) {
        bytes -= this.bufs[0].byteLength
        this.length -= this.bufs[0].byteLength
        this.bufs.shift()
      } else {
        this.bufs[0] = this.bufs[0].subarray(bytes)
        this.length -= bytes
        break
      }
    }
  }

  slice (beginInclusive?: number, endExclusive?: number) {
    const { bufs, length } = this._subList(beginInclusive, endExclusive)

    return concat(bufs, length)
  }

  subarray (beginInclusive?: number, endExclusive?: number) {
    const { bufs } = this._subList(beginInclusive, endExclusive)

    const list = new Uint8ArrayList()
    list.appendAll(bufs)

    return list
  }

  _subList (beginInclusive?: number, endExclusive?: number) {
    if (beginInclusive == null && endExclusive == null) {
      return { bufs: this.bufs, length: this.length }
    }

    beginInclusive = beginInclusive ?? 0
    endExclusive = endExclusive ?? (this.length > 0 ? this.length : 0)

    if (beginInclusive < 0 || endExclusive > this.length) {
      throw new RangeError('index out of bounds')
    }

    if (beginInclusive === endExclusive) {
      return { bufs: [], length: 0 }
    }

    const bufs: Uint8Array[] = []
    let offset = 0

    for (const buf of this.bufs) {
      const bufStart = offset
      const bufEnd = bufStart + buf.byteLength
      const sliceStartInBuf = beginInclusive >= bufStart && beginInclusive < bufEnd
      const sliceEndsInBuf = endExclusive > bufStart && endExclusive <= bufEnd
      const bufInSlice = beginInclusive < bufStart && endExclusive >= bufEnd
      offset = bufEnd

      let startIndex: number | undefined
      let endIndex: number | undefined

      if (sliceStartInBuf) {
        startIndex = beginInclusive - bufStart
        endIndex = buf.byteLength
      }

      if (sliceEndsInBuf) {
        endIndex = endExclusive - bufStart

        if (startIndex == null) {
          startIndex = 0
        }
      }

      if (bufInSlice) {
        startIndex = 0
        endIndex = buf.byteLength
      }

      if (startIndex != null && endIndex != null) {
        bufs.push(buf.subarray(startIndex, endIndex))
      }

      if (sliceEndsInBuf) {
        break
      }
    }

    return { bufs, length: endExclusive - beginInclusive }
  }
}
