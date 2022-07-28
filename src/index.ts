import { concat } from 'uint8arrays'

const symbol = Symbol.for('@achingbrain/uint8arraylist')

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

/**
 * Check if object is a CID instance
 */
export function isUint8ArrayList (value: any): value is Uint8ArrayList {
  return Boolean(value?.[symbol])
}

export class Uint8ArrayList implements Iterable<Uint8Array> {
  private bufs: Uint8Array[]
  public length: number

  constructor (...data: Appendable[]) {
    // Define symbol
    Object.defineProperty(this, symbol, { value: true })

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
      } else if (isUint8ArrayList(buf)) {
        length += buf.length
        this.bufs = this.bufs.concat(buf.bufs)
      } else {
        throw new Error('Could not append value, must be an Uint8Array or a Uint8ArrayList')
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
    } else if (isUint8ArrayList(buf)) {
      for (let i = 0; i < buf.length; i++) {
        this.set(offset + i, buf.get(i))
      }
    } else {
      throw new Error('Could not write value, must be an Uint8Array or a Uint8ArrayList')
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

    if (beginInclusive < 0) {
      beginInclusive = this.length + beginInclusive
    }

    if (endExclusive < 0) {
      endExclusive = this.length + endExclusive
    }

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

  getInt8 (byteOffset: number): number {
    const buf = this.slice(byteOffset, byteOffset + 1)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

    return view.getInt8(0)
  }

  setInt8 (byteOffset: number, value: number): void {
    const buf = new Uint8Array(1)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    view.setInt8(0, value)

    this.write(buf, byteOffset)
  }

  getInt16 (byteOffset: number, littleEndian?: boolean): number {
    const buf = this.slice(byteOffset, byteOffset + 2)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

    return view.getInt16(0, littleEndian)
  }

  setInt16 (byteOffset: number, value: number, littleEndian?: boolean): void {
    const buf = new Uint8Array(2)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    view.setInt16(0, value, littleEndian)

    this.write(buf, byteOffset)
  }

  getInt32 (byteOffset: number, littleEndian?: boolean): number {
    const buf = this.slice(byteOffset, byteOffset + 4)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

    return view.getInt32(0, littleEndian)
  }

  setInt32 (byteOffset: number, value: number, littleEndian?: boolean): void {
    const buf = new Uint8Array(4)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    view.setInt32(0, value, littleEndian)

    this.write(buf, byteOffset)
  }

  getBigInt64 (byteOffset: number, littleEndian?: boolean): bigint {
    const buf = this.slice(byteOffset, byteOffset + 8)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

    return view.getBigInt64(0, littleEndian)
  }

  setBigInt64 (byteOffset: number, value: bigint, littleEndian?: boolean): void {
    const buf = new Uint8Array(8)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    view.setBigInt64(0, value, littleEndian)

    this.write(buf, byteOffset)
  }

  getUint8 (byteOffset: number): number {
    const buf = this.slice(byteOffset, byteOffset + 1)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

    return view.getUint8(0)
  }

  setUint8 (byteOffset: number, value: number): void {
    const buf = new Uint8Array(1)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    view.setUint8(0, value)

    this.write(buf, byteOffset)
  }

  getUint16 (byteOffset: number, littleEndian?: boolean): number {
    const buf = this.slice(byteOffset, byteOffset + 2)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

    return view.getUint16(0, littleEndian)
  }

  setUint16 (byteOffset: number, value: number, littleEndian?: boolean): void {
    const buf = new Uint8Array(2)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    view.setUint16(0, value, littleEndian)

    this.write(buf, byteOffset)
  }

  getUint32 (byteOffset: number, littleEndian?: boolean): number {
    const buf = this.slice(byteOffset, byteOffset + 4)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

    return view.getUint32(0, littleEndian)
  }

  setUint32 (byteOffset: number, value: number, littleEndian?: boolean): void {
    const buf = new Uint8Array(4)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    view.setUint32(0, value, littleEndian)

    this.write(buf, byteOffset)
  }

  getBigUint64 (byteOffset: number, littleEndian?: boolean): bigint {
    const buf = this.slice(byteOffset, byteOffset + 8)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

    return view.getBigUint64(0, littleEndian)
  }

  setBigUint64 (byteOffset: number, value: bigint, littleEndian?: boolean): void {
    const buf = new Uint8Array(8)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    view.setBigUint64(0, value, littleEndian)

    this.write(buf, byteOffset)
  }

  getFloat32 (byteOffset: number, littleEndian?: boolean): number {
    const buf = this.slice(byteOffset, byteOffset + 4)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

    return view.getFloat32(0, littleEndian)
  }

  setFloat32 (byteOffset: number, value: number, littleEndian?: boolean): void {
    const buf = new Uint8Array(4)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    view.setFloat32(0, value, littleEndian)

    this.write(buf, byteOffset)
  }

  getFloat64 (byteOffset: number, littleEndian?: boolean): number {
    const buf = this.slice(byteOffset, byteOffset + 8)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

    return view.getFloat64(0, littleEndian)
  }

  setFloat64 (byteOffset: number, value: number, littleEndian?: boolean): void {
    const buf = new Uint8Array(8)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    view.setFloat64(0, value, littleEndian)

    this.write(buf, byteOffset)
  }
}
