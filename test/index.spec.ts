import { expect } from 'aegir/utils/chai.js'
import { Uint8ArrayList, isUint8ArrayList } from '../src/index.js'
import { toString } from 'uint8arrays/to-string'
import { fromString } from 'uint8arrays/from-string'
import all from 'it-all'

describe('Uint8arrayList', () => {
  describe('constructor', () => {
    it('constructor accepts no args', () => {
      const bl = new Uint8ArrayList()

      expect(bl.length).to.equal(0)
      expect(toString(bl.slice(), 'ascii')).to.equal('')
    })

    it('constructor accepts a Uint8Array', () => {
      const bl = new Uint8ArrayList(
        new Uint8Array([97, 98, 99])
      )

      expect(bl.length).to.equal(3)
      expect(toString(bl.slice(), 'ascii')).to.equal('abc')
    })

    it('constructor accepts multiple Uint8Arrays', () => {
      const bl = new Uint8ArrayList(
        new Uint8Array([97, 98, 99]),
        Uint8Array.from([100, 101, 102]),
        new Uint8Array([103, 104, 105]),
        new Uint8Array([106, 107, 108]),
        new Uint8Array([109, 110, 111, 112]),
        new Uint8Array([113, 114, 115, 116, 117]),
        new Uint8Array([118, 119, 120, 121, 122])
      )

      expect(bl.length).to.equal(26)
      expect(toString(bl.slice(), 'ascii')).to.equal('abcdefghijklmnopqrstuvwxyz')
    })
  })

  describe('byteLength', () => {
    it('byteLength is the same as length', () => {
      const bl = new Uint8ArrayList()

      expect(bl.length).to.equal(0)
      expect(bl.byteLength).to.equal(0)

      bl.append(Uint8Array.from([0, 1, 2]))

      expect(bl.length).to.equal(3)
      expect(bl.byteLength).to.equal(3)

      bl.consume(1)

      expect(bl.length).to.equal(2)
      expect(bl.byteLength).to.equal(2)
    })
  })

  describe('get', () => {
    it('single bytes from single buffer', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))

      expect(bl.length).to.equal(4)
      expect(bl.get(0)).to.equal(97)
      expect(bl.get(1)).to.equal(98)
      expect(bl.get(2)).to.equal(99)
      expect(bl.get(3)).to.equal(100)

      expect(() => bl.get(-1)).to.throw(RangeError)
      expect(() => bl.get(4)).to.throw(RangeError)
      expect(() => bl.get(5)).to.throw(RangeError)
    })

    it('single bytes from multiple buffers', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))
      bl.append(fromString('efg'))
      bl.append(fromString('hi'))
      bl.append(fromString('j'))

      expect(bl.length).to.equal(10)

      expect(bl.get(0)).to.equal(97)
      expect(bl.get(1)).to.equal(98)
      expect(bl.get(2)).to.equal(99)
      expect(bl.get(3)).to.equal(100)
      expect(bl.get(4)).to.equal(101)
      expect(bl.get(5)).to.equal(102)
      expect(bl.get(6)).to.equal(103)
      expect(bl.get(7)).to.equal(104)
      expect(bl.get(8)).to.equal(105)
      expect(bl.get(9)).to.equal(106)
    })

    it('get returns bytes', () => {
      const bl = new Uint8ArrayList()

      bl.append(
        new Uint8Array([97, 98, 99]),
        Uint8Array.from([100, 101, 102]),
        new Uint8Array([103, 104, 105]),
        new Uint8Array([106, 107, 108]),
        new Uint8Array([109, 110, 111, 112]),
        new Uint8Array([113, 114, 115, 116, 117]),
        new Uint8Array([118, 119, 120, 121, 122])
      )

      expect(bl.length).to.equal(26)

      const letters = 'abcdefghijklmnopqrstuvwxyz'

      for (let i = 0; i < letters.length; i++) {
        const val = bl.get(i)
        expect(val).to.equal(fromString(letters[i])[0])
      }
    })
  })

  describe('set', () => {
    it('single bytes in a single buffer', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))

      expect(bl.length).to.equal(4)

      expect(bl.get(0)).to.equal(97)
      bl.set(0, 123)
      expect(bl.get(0)).to.equal(123)

      expect(bl.get(3)).to.equal(100)
      bl.set(3, 111)
      expect(bl.get(3)).to.equal(111)

      expect(() => bl.set(-1, 5)).to.throw(RangeError)
      expect(() => bl.set(4, 5)).to.throw(RangeError)
      expect(() => bl.set(5, 5)).to.throw(RangeError)
    })

    it('sets bytes in multiple buffers', () => {
      const bl = new Uint8ArrayList()

      bl.append(
        new Uint8Array([97, 98, 99]),
        Uint8Array.from([100, 101, 102]),
        new Uint8Array([103, 104, 105]),
        new Uint8Array([106, 107, 108]),
        new Uint8Array([109, 110, 111, 112]),
        new Uint8Array([113, 114, 115, 116, 117]),
        new Uint8Array([118, 119, 120, 121, 122])
      )

      expect(bl.length).to.equal(26)

      const letters = 'abcdefghijklmnopqrstuvwxyz'

      for (let i = 0; i < letters.length; i++) {
        const val = bl.get(i)
        expect(val).to.equal(fromString(letters[i])[0])

        bl.set(i, 5)
        expect(bl.get(i)).to.equal(5)
      }
    })
  })

  describe('write', () => {
    it('does not allow out of range writes', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))

      expect(() => bl.write(fromString('b'), -1)).to.throw(RangeError)
      expect(() => bl.write(fromString('b'), 4)).to.throw(RangeError)
      expect(() => bl.write(fromString('b'), 5)).to.throw(RangeError)
    })

    it('writes into a single buffer', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))

      expect(bl.length).to.equal(4)

      bl.write(fromString('b'))

      expect(toString(bl.slice())).to.equal('bbcd')
    })

    it('writes into a multiple buffers', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))
      bl.append(fromString('efgh'))

      expect(bl.length).to.equal(8)

      bl.write(fromString('1234'), 2)

      expect(toString(bl.slice())).to.equal('ab1234gh')
    })

    it('only writes appendable values', () => {
      const bl = new Uint8ArrayList()

      // @ts-expect-error invalid params
      expect(() => bl.write('hello')).to.throw(/must be an Uint8Array or a Uint8ArrayList/)
      // @ts-expect-error invalid params
      expect(() => bl.write(5)).to.throw(/must be an Uint8Array or a Uint8ArrayList/)
      // @ts-expect-error invalid params
      expect(() => bl.write(null)).to.throw(/must be an Uint8Array or a Uint8ArrayList/)
      // @ts-expect-error invalid params
      expect(() => bl.write([5])).to.throw(/must be an Uint8Array or a Uint8ArrayList/)
    })
  })

  describe('slice', () => {
    it('multi bytes from single buffer', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))

      expect(bl.length).to.equal(4)

      expect(toString(bl.slice(0, 4), 'ascii')).to.equal('abcd')
      expect(toString(bl.slice(0, 3), 'ascii')).to.equal('abc')
      expect(toString(bl.slice(1, 4), 'ascii')).to.equal('bcd')
      expect(() => toString(bl.slice(-4, -1), 'ascii')).to.throw(RangeError)
    })

    it('multiple bytes from multiple buffers', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))
      bl.append(fromString('efg'))
      bl.append(fromString('hi'))
      bl.append(fromString('j'))

      expect(bl.length).to.equal(10)

      expect(toString(bl.slice(0, 0), 'ascii')).to.equal('')
      expect(toString(bl.slice(0, 1), 'ascii')).to.equal('a')
      expect(toString(bl.slice(0, 10), 'ascii')).to.equal('abcdefghij')
      expect(toString(bl.slice(3, 10), 'ascii')).to.equal('defghij')
      expect(toString(bl.slice(3, 6), 'ascii')).to.equal('def')
      expect(toString(bl.slice(3, 8), 'ascii')).to.equal('defgh')
      expect(toString(bl.slice(5, 10), 'ascii')).to.equal('fghij')
      expect(() => toString(bl.slice(-7, -4), 'ascii')).to.throw(RangeError)
    })
  })

  describe('subarray', () => {
    it('multi bytes from single buffer', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))

      expect(bl.length).to.equal(4)

      expect(toString(bl.subarray(0, 4).slice(), 'ascii')).to.equal('abcd')
      expect(toString(bl.subarray(0, 3).slice(), 'ascii')).to.equal('abc')
      expect(toString(bl.subarray(1, 4).slice(), 'ascii')).to.equal('bcd')
      expect(() => toString(bl.subarray(-4, -1).slice(), 'ascii')).to.throw(RangeError)
    })

    it('multiple bytes from multiple buffers', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))
      bl.append(fromString('efg'))
      bl.append(fromString('hi'))
      bl.append(fromString('j'))

      expect(bl.length).to.equal(10)

      expect(toString(bl.subarray(0, 0).slice(), 'ascii')).to.equal('')
      expect(toString(bl.subarray(0, 1).slice(), 'ascii')).to.equal('a')
      expect(toString(bl.subarray(0, 10).slice(), 'ascii')).to.equal('abcdefghij')
      expect(toString(bl.subarray(3, 10).slice(), 'ascii')).to.equal('defghij')
      expect(toString(bl.subarray(3, 6).slice(), 'ascii')).to.equal('def')
      expect(toString(bl.subarray(3, 8).slice(), 'ascii')).to.equal('defgh')
      expect(toString(bl.subarray(5, 10).slice(), 'ascii')).to.equal('fghij')
      expect(() => toString(bl.subarray(-7, -4).slice(), 'ascii')).to.throw(RangeError)
    })
  })

  describe('append', () => {
    it('append accepts Uint8Arrays', () => {
      const bl = new Uint8ArrayList()

      bl.append(new Uint8Array([97, 98, 99]))
      bl.append(Uint8Array.from([100, 101, 102]))
      bl.append(new Uint8Array([103, 104, 105]))
      bl.append(new Uint8Array([106, 107, 108]))
      bl.append(new Uint8Array([109, 110, 111, 112]))
      bl.append(new Uint8Array([113, 114, 115, 116, 117]))
      bl.append(new Uint8Array([118, 119, 120, 121, 122]))

      expect(bl.length).to.equal(26)
      expect(toString(bl.slice(), 'ascii')).to.equal('abcdefghijklmnopqrstuvwxyz')
    })

    it('append accepts multiple Uint8Arrays', () => {
      const bl = new Uint8ArrayList()

      bl.append(
        new Uint8Array([97, 98, 99]),
        Uint8Array.from([100, 101, 102]),
        new Uint8Array([103, 104, 105]),
        new Uint8Array([106, 107, 108]),
        new Uint8Array([109, 110, 111, 112]),
        new Uint8Array([113, 114, 115, 116, 117]),
        new Uint8Array([118, 119, 120, 121, 122])
      )

      expect(bl.length).to.equal(26)
      expect(toString(bl.slice(), 'ascii')).to.equal('abcdefghijklmnopqrstuvwxyz')
    })

    it('only appends appendable values', () => {
      const bl = new Uint8ArrayList()

      // @ts-expect-error invalid params
      expect(() => bl.append('hello')).to.throw(/must be an Uint8Array or a Uint8ArrayList/)
      // @ts-expect-error invalid params
      expect(() => bl.append(5)).to.throw(/must be an Uint8Array or a Uint8ArrayList/)
      // @ts-expect-error invalid params
      expect(() => bl.append(null)).to.throw(/must be an Uint8Array or a Uint8ArrayList/)
      // @ts-expect-error invalid params
      expect(() => bl.append([5])).to.throw(/must be an Uint8Array or a Uint8ArrayList/)
    })
  })

  describe('appendAll', () => {
    it('appendAll accepts multiple Uint8Arrays', () => {
      const bl = new Uint8ArrayList()

      bl.appendAll([
        new Uint8Array([97, 98, 99]),
        Uint8Array.from([100, 101, 102]),
        new Uint8Array([103, 104, 105]),
        new Uint8Array([106, 107, 108]),
        new Uint8Array([109, 110, 111, 112]),
        new Uint8Array([113, 114, 115, 116, 117]),
        new Uint8Array([118, 119, 120, 121, 122])
      ])

      expect(bl.length).to.equal(26)
      expect(toString(bl.slice(), 'ascii')).to.equal('abcdefghijklmnopqrstuvwxyz')
    })
  })

  describe('consume', () => {
    it('consuming from multiple buffers', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('abcd'))
      bl.append(fromString('efg'))
      bl.append(fromString('hi'))
      bl.append(fromString('j'))

      expect(bl.length).to.equal(10)

      expect(toString(bl.slice(0, 10), 'ascii')).to.equal('abcdefghij')

      bl.consume(3)
      expect(bl.length).to.equal(7)
      expect(toString(bl.slice(0, 7), 'ascii')).to.equal('defghij')

      bl.consume(2)
      expect(bl.length).to.equal(5)
      expect(toString(bl.slice(0, 5), 'ascii')).to.equal('fghij')

      bl.consume(1)
      expect(bl.length).to.equal(4)
      expect(toString(bl.slice(0, 4), 'ascii')).to.equal('ghij')

      bl.consume(1)
      expect(bl.length).to.equal(3)
      expect(toString(bl.slice(0, 3), 'ascii')).to.equal('hij')

      bl.consume(2)
      expect(bl.length).to.equal(1)
      expect(toString(bl.slice(0, 1), 'ascii')).to.equal('j')
    })

    it('complete consumption', () => {
      const bl = new Uint8ArrayList()

      bl.append(fromString('a'))
      bl.append(fromString('b'))

      bl.consume(2)

      expect(bl.length).to.equal(0)
      expect(bl.slice().byteLength).to.equal(0)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should be iterable', async () => {
      const input = [
        Uint8Array.from([0, 1, 2]),
        Uint8Array.from([3, 4, 5])
      ]

      const bl = new Uint8ArrayList()
      bl.append(input[0])
      bl.append(input[1])

      const res = await all(bl)

      expect(res).to.deep.equal(input)
      expect([...bl]).to.deep.equal(input)
    })
  })

  describe('DataView methods', () => {
    it('should get Int 8', () => {
      const value = 100

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setInt8(0, value)

      const list = new Uint8ArrayList(buf)

      expect(list.getInt8(0)).to.equal(view.getInt8(0))
      expect(list.getInt8(0)).to.equal(value)
    })

    it('should get big endian Int 16', () => {
      const value = 20292

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setInt16(0, value, false)

      const list = new Uint8ArrayList(buf)

      expect(list.getInt16(0, false)).to.equal(view.getInt16(0, false))
      expect(list.getInt16(0, false)).to.equal(value)
    })

    it('should get little endian Int 16', () => {
      const value = 20292

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setInt16(0, value, true)

      const list = new Uint8ArrayList(buf)

      expect(list.getInt16(0, true)).to.equal(view.getInt16(0, true))
      expect(list.getInt16(0, true)).to.equal(value)
    })

    it('should get big endian Int 32', () => {
      const value = 80292

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setInt32(0, value, false)

      const list = new Uint8ArrayList(buf)

      expect(list.getInt32(0, false)).to.equal(view.getInt32(0, false))
      expect(list.getInt32(0, false)).to.equal(value)
    })

    it('should get little endian Int 32', () => {
      const value = 80292

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setInt32(0, value, true)

      const list = new Uint8ArrayList(buf)

      expect(list.getInt32(0, true)).to.equal(view.getInt32(0, true))
      expect(list.getInt32(0, true)).to.equal(value)
    })

    it('should get big endian BigInt 64', () => {
      const value = 5313523425837842432n

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setBigInt64(0, value, false)

      const list = new Uint8ArrayList(buf)

      expect(list.getBigInt64(0, false)).to.equal(view.getBigInt64(0, false))
      expect(list.getBigInt64(0, false)).to.equal(value)
    })

    it('should get little endian BigInt 64', () => {
      const value = 5313523425837842432n

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setBigInt64(0, value, true)

      const list = new Uint8ArrayList(buf)

      expect(list.getBigInt64(0, true)).to.equal(view.getBigInt64(0, true))
      expect(list.getBigInt64(0, true)).to.equal(value)
    })

    it('should get Uint 8', () => {
      const value = 128

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setUint8(0, value)

      const list = new Uint8ArrayList(buf)

      expect(list.getUint8(0)).to.equal(view.getUint8(0))
      expect(list.getUint8(0)).to.equal(value)
    })

    it('should get big endian Uint 16', () => {
      const value = 20292

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setUint16(0, value, false)

      const list = new Uint8ArrayList(buf)

      expect(list.getUint16(0, false)).to.equal(view.getUint16(0, false))
      expect(list.getUint16(0, false)).to.equal(value)
    })

    it('should get little endian Uint 16', () => {
      const value = 20292

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setUint16(0, value, true)

      const list = new Uint8ArrayList(buf)

      expect(list.getUint16(0, true)).to.equal(view.getUint16(0, true))
      expect(list.getUint16(0, true)).to.equal(value)
    })

    it('should get big endian Uint 32', () => {
      const value = 80292

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setUint32(0, value, false)

      const list = new Uint8ArrayList(buf)

      expect(list.getUint32(0, false)).to.equal(view.getUint32(0, false))
      expect(list.getUint32(0, false)).to.equal(value)
    })

    it('should get little endian Uint 32', () => {
      const value = 80292

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setUint32(0, value, true)

      const list = new Uint8ArrayList(buf)

      expect(list.getUint32(0, true)).to.equal(view.getUint32(0, true))
      expect(list.getUint32(0, true)).to.equal(value)
    })

    it('should get big endian BigUint 64', () => {
      const value = 5313523425837842432n

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setBigUint64(0, value, false)

      const list = new Uint8ArrayList(buf)

      expect(list.getBigUint64(0, false)).to.equal(view.getBigUint64(0, false))
      expect(list.getBigUint64(0, false)).to.equal(value)
    })

    it('should get little endian BigUint 64', () => {
      const value = 5313523425837842432n

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setBigUint64(0, value, true)

      const list = new Uint8ArrayList(buf)

      expect(list.getBigUint64(0, true)).to.equal(view.getBigUint64(0, true))
      expect(list.getBigUint64(0, true)).to.equal(value)
    })

    it('should get big endian Float 32', () => {
      const value = 44942.34

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setFloat32(0, value, false)

      const list = new Uint8ArrayList(buf)

      expect(list.getFloat32(0, false)).to.equal(view.getFloat32(0, false))
      // expect(list.getFloat32(0, false)).to.equal(value)
    })

    it('should get little endian Float 32', () => {
      const value = 44942.34

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setFloat32(0, value, true)

      const list = new Uint8ArrayList(buf)

      expect(list.getFloat32(0, true)).to.equal(view.getFloat32(0, true))
      // expect(list.getFloat32(0, true)).to.equal(value)
    })

    it('should get big endian Float 64', () => {
      const value = 444942.3

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setFloat64(0, value, false)

      const list = new Uint8ArrayList(buf)

      expect(list.getFloat64(0, false)).to.equal(view.getFloat64(0, false))
      expect(list.getFloat64(0, false)).to.equal(value)
    })

    it('should get little endian Float 64', () => {
      const value = 444942.3

      const buf = new Uint8Array(8)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
      view.setFloat64(0, value, true)

      const list = new Uint8ArrayList(buf)

      expect(list.getFloat64(0, true)).to.equal(view.getFloat64(0, true))
      expect(list.getFloat64(0, true)).to.equal(value)
    })

    it('should set Int 8', () => {
      const value = 100

      const buf = new Uint8Array(1)
      const list = new Uint8ArrayList(buf)
      list.setInt8(0, value)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getInt8(0)).to.equal(view.getInt8(0))
      expect(list.getInt8(0)).to.equal(value)
    })

    it('should set big endian Int 16', () => {
      const value = 12932

      const buf = new Uint8Array(2)
      const list = new Uint8ArrayList(buf)
      list.setInt16(0, value, false)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getInt16(0, false)).to.equal(view.getInt16(0, false))
      expect(list.getInt16(0, false)).to.equal(value)
    })

    it('should set little endian Int 16', () => {
      const value = 12932

      const buf = new Uint8Array(2)
      const list = new Uint8ArrayList(buf)
      list.setInt16(0, value, true)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getInt16(0, true)).to.equal(view.getInt16(0, true))
      expect(list.getInt16(0, true)).to.equal(value)
    })

    it('should set big endian Int 32', () => {
      const value = 22932

      const buf = new Uint8Array(4)
      const list = new Uint8ArrayList(buf)
      list.setInt32(0, value, false)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getInt32(0, false)).to.equal(view.getInt32(0, false))
      expect(list.getInt32(0, false)).to.equal(value)
    })

    it('should set little endian Int 32', () => {
      const value = 22932

      const buf = new Uint8Array(4)
      const list = new Uint8ArrayList(buf)
      list.setInt32(0, value, true)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getInt32(0, true)).to.equal(view.getInt32(0, true))
      expect(list.getInt32(0, true)).to.equal(value)
    })

    it('should set big endian Int 64', () => {
      const value = 23982932n

      const buf = new Uint8Array(8)
      const list = new Uint8ArrayList(buf)
      list.setBigInt64(0, value, false)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getBigInt64(0, false)).to.equal(view.getBigInt64(0, false))
      expect(list.getBigInt64(0, false)).to.equal(value)
    })

    it('should set little endian Int 64', () => {
      const value = 23982932n

      const buf = new Uint8Array(8)
      const list = new Uint8ArrayList(buf)
      list.setBigInt64(0, value, true)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getBigInt64(0, true)).to.equal(view.getBigInt64(0, true))
      expect(list.getBigInt64(0, true)).to.equal(value)
    })

    it('should set Uint 8', () => {
      const value = 100

      const buf = new Uint8Array(8)
      const list = new Uint8ArrayList(buf)
      list.setUint8(0, value)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getUint8(0)).to.equal(view.getUint8(0))
      expect(list.getUint8(0)).to.equal(value)
    })

    it('should set big endian Uint 16', () => {
      const value = 12932

      const buf = new Uint8Array(2)
      const list = new Uint8ArrayList(buf)
      list.setUint16(0, value, false)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getUint16(0, false)).to.equal(view.getUint16(0, false))
      expect(list.getUint16(0, false)).to.equal(value)
    })

    it('should set little endian Uint 16', () => {
      const value = 12932

      const buf = new Uint8Array(2)
      const list = new Uint8ArrayList(buf)
      list.setUint16(0, value, true)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getUint16(0, true)).to.equal(view.getUint16(0, true))
      expect(list.getUint16(0, true)).to.equal(value)
    })

    it('should set big endian Uint 32', () => {
      const value = 22932

      const buf = new Uint8Array(4)
      const list = new Uint8ArrayList(buf)
      list.setUint32(0, value, false)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getUint32(0, false)).to.equal(view.getUint32(0, false))
      expect(list.getUint32(0, false)).to.equal(value)
    })

    it('should set little endian Uint 32', () => {
      const value = 22932

      const buf = new Uint8Array(4)
      const list = new Uint8ArrayList(buf)
      list.setUint32(0, value, true)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getUint32(0, true)).to.equal(view.getUint32(0, true))
      expect(list.getUint32(0, true)).to.equal(value)
    })

    it('should set big endian Uint 64', () => {
      const value = 23982932n

      const buf = new Uint8Array(8)
      const list = new Uint8ArrayList(buf)
      list.setBigUint64(0, value, false)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getBigUint64(0, false)).to.equal(view.getBigUint64(0, false))
      expect(list.getBigUint64(0, false)).to.equal(value)
    })

    it('should set little endian Uint 64', () => {
      const value = 23982932n

      const buf = new Uint8Array(8)
      const list = new Uint8ArrayList(buf)
      list.setBigUint64(0, value, true)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getBigUint64(0, true)).to.equal(view.getBigUint64(0, true))
      expect(list.getBigUint64(0, true)).to.equal(value)
    })

    it('should set big endian Float 32', () => {
      const value = 22932.3929

      const buf = new Uint8Array(4)
      const list = new Uint8ArrayList(buf)
      list.setFloat32(0, value, false)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getFloat32(0, false)).to.equal(view.getFloat32(0, false))
      // expect(list.getFloat32(0, false)).to.equal(value)
    })

    it('should set little endian Float 32', () => {
      const value = 22932.3929

      const buf = new Uint8Array(4)
      const list = new Uint8ArrayList(buf)
      list.setFloat32(0, value, true)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getFloat32(0, true)).to.equal(view.getFloat32(0, true))
      // expect(list.getFloat32(0, true)).to.equal(value)
    })

    it('should set big endian Float 64', () => {
      const value = 22932.3929

      const buf = new Uint8Array(8)
      const list = new Uint8ArrayList(buf)
      list.setFloat64(0, value, false)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getFloat64(0, false)).to.equal(view.getFloat64(0, false))
      expect(list.getFloat64(0, false)).to.equal(value)
    })

    it('should set little endian Float 64', () => {
      const value = 22932.3929

      const buf = new Uint8Array(8)
      const list = new Uint8ArrayList(buf)
      list.setFloat64(0, value, true)

      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      expect(list.getFloat64(0, true)).to.equal(view.getFloat64(0, true))
      expect(list.getFloat64(0, true)).to.equal(value)
    })
  })

  describe('isUint8ArrayList', () => {
    it('should detect Uint8ArrayList', () => {
      expect(isUint8ArrayList(new Uint8ArrayList())).to.be.true()
      expect(isUint8ArrayList([])).to.be.false()
      expect(isUint8ArrayList(null)).to.be.false()
      expect(isUint8ArrayList(undefined)).to.be.false()
      expect(isUint8ArrayList('hello')).to.be.false()
      expect(isUint8ArrayList(true)).to.be.false()
    })
  })
})
