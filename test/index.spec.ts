import { expect } from 'aegir/utils/chai.js'
import { Uint8ArrayList } from '../src/index.js'
import { toString } from 'uint8arrays/to-string'
import { fromString } from 'uint8arrays/from-string'

describe('Uint8arrayList', () => {
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

  it('multi bytes from single buffer', () => {
    const bl = new Uint8ArrayList()

    bl.append(fromString('abcd'))

    expect(bl.length).to.equal(4)

    expect(toString(bl.toUint8Array(0, 4), 'ascii')).to.equal('abcd')
    expect(toString(bl.toUint8Array(0, 3), 'ascii')).to.equal('abc')
    expect(toString(bl.toUint8Array(1, 4), 'ascii')).to.equal('bcd')
    expect(() => toString(bl.toUint8Array(-4, -1), 'ascii')).to.throw(RangeError)
  })

  it('multiple bytes from multiple buffers', () => {
    const bl = new Uint8ArrayList()

    bl.append(fromString('abcd'))
    bl.append(fromString('efg'))
    bl.append(fromString('hi'))
    bl.append(fromString('j'))

    expect(bl.length).to.equal(10)

    expect(toString(bl.toUint8Array(0, 10), 'ascii')).to.equal('abcdefghij')
    expect(toString(bl.toUint8Array(3, 10), 'ascii')).to.equal('defghij')
    expect(toString(bl.toUint8Array(3, 6), 'ascii')).to.equal('def')
    expect(toString(bl.toUint8Array(3, 8), 'ascii')).to.equal('defgh')
    expect(toString(bl.toUint8Array(5, 10), 'ascii')).to.equal('fghij')
    expect(() => toString(bl.toUint8Array(-7, -4), 'ascii')).to.throw(RangeError)
  })

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
    expect(toString(bl.toUint8Array(), 'ascii')).to.equal('abcdefghijklmnopqrstuvwxyz')
  })

  it('consuming from multiple buffers', () => {
    const bl = new Uint8ArrayList()

    bl.append(fromString('abcd'))
    bl.append(fromString('efg'))
    bl.append(fromString('hi'))
    bl.append(fromString('j'))

    expect(bl.length).to.equal(10)

    expect(toString(bl.toUint8Array(0, 10), 'ascii')).to.equal('abcdefghij')

    bl.consume(3)
    expect(bl.length).to.equal(7)
    expect(toString(bl.toUint8Array(0, 7), 'ascii')).to.equal('defghij')

    bl.consume(2)
    expect(bl.length).to.equal(5)
    expect(toString(bl.toUint8Array(0, 5), 'ascii')).to.equal('fghij')

    bl.consume(1)
    expect(bl.length).to.equal(4)
    expect(toString(bl.toUint8Array(0, 4), 'ascii')).to.equal('ghij')

    bl.consume(1)
    expect(bl.length).to.equal(3)
    expect(toString(bl.toUint8Array(0, 3), 'ascii')).to.equal('hij')

    bl.consume(2)
    expect(bl.length).to.equal(1)
    expect(toString(bl.toUint8Array(0, 1), 'ascii')).to.equal('j')
  })

  it('complete consumption', () => {
    const bl = new Uint8ArrayList()

    bl.append(fromString('a'))
    bl.append(fromString('b'))

    bl.consume(2)

    expect(bl.length).to.equal(0)
    expect(bl.toUint8Array().byteLength).to.equal(0)
  })
})
