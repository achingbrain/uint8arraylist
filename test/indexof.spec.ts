import { expect } from 'aegir/chai'
import { Uint8ArrayList } from '../src/index.js'
import { fromString } from 'uint8arrays/from-string'

describe('indexOf', () => {
  it('should find index of single byte needle', () => {
    const bl = new Uint8ArrayList(
      fromString('abcdefg'),
      fromString('abcdefg'),
      fromString('12345')
    )

    expect(bl.indexOf(fromString('e'))).to.equal(4)
    expect(bl.indexOf(fromString('e'), 5)).to.equal(11)
    expect(bl.indexOf(fromString('e'), 12)).to.equal(-1)
    expect(bl.indexOf(fromString('5'))).to.equal(18)
  })

  it('should find indexOf multiple byte needle', () => {
    const bl = new Uint8ArrayList(
      fromString('abcdefg'),
      fromString('abcdefg')
    )

    expect(bl.indexOf(fromString('ef'))).to.equal(4)
    expect(bl.indexOf(fromString('ef'), 5)).to.equal(11)
  })

  it('should find indexOf multiple byte needles across buffer boundaries', () => {
    const bl = new Uint8ArrayList(
      fromString('abcdefg'),
      fromString('abcdefg')
    )

    expect(bl.indexOf(fromString('fgabc'))).to.equal(5)
  })

  it('should find indexOf takes a Uint8Array search', () => {
    const bl = new Uint8ArrayList(
      fromString('abcdefg'),
      fromString('abcdefg')
    )
    const search = new Uint8Array([102, 103, 97, 98, 99]) // fgabc

    expect(bl.indexOf(search)).to.equal(5)
  })

  it('should find indexOf takes a buffer list search', () => {
    const bl = new Uint8ArrayList(
      fromString('abcdefg'),
      fromString('abcdefg')
    )
    const search = new Uint8ArrayList(fromString('fgabc'))

    expect(bl.indexOf(search)).to.equal(5)
  })

  it('should find indexOf a zero byte needle', () => {
    const b = new Uint8ArrayList(fromString('abcdef'))
    const bufEmpty = fromString('')

    expect(b.indexOf(bufEmpty)).to.equal(0)
    expect(b.indexOf(bufEmpty, 1)).to.equal(1)
    expect(b.indexOf(bufEmpty, b.byteLength + 1)).to.equal(b.byteLength)
    expect(b.indexOf(bufEmpty, Infinity)).to.equal(b.byteLength)
  })

  it('should find indexOf buffers smaller and larger than the needle', () => {
    const bl = new Uint8ArrayList(
      fromString('abcdefg'),
      fromString('a'),
      fromString('bcdefg'),
      fromString('a'),
      fromString('bcfgab')
    )

    expect(bl.indexOf(fromString('fgabc'))).to.equal(5)
    expect(bl.indexOf(fromString('fgabc'), 6)).to.equal(12)
    expect(bl.indexOf(fromString('fgabc'), 13)).to.equal(-1)
  })

  it('should find indexOf the entire nodejs10 buffer test suite except string encoding tests', () => {
    const b = new Uint8ArrayList(fromString('abcdef'))
    const bufA = fromString('a')
    const bufBc = fromString('bc')
    const bufF = fromString('f')
    const bufZ = fromString('z')

    expect(b.indexOf(fromString('a'))).to.equal(0)
    expect(b.indexOf(fromString('a'), 1)).to.equal(-1)
    expect(b.indexOf(fromString('a'), -1)).to.equal(-1)
    expect(b.indexOf(fromString('a'), -4)).to.equal(-1)
    expect(b.indexOf(fromString('a'), -b.length)).to.equal(0)
    expect(b.indexOf(fromString('a'), NaN)).to.equal(0)
    expect(b.indexOf(fromString('a'), -Infinity)).to.equal(0)
    expect(b.indexOf(fromString('a'), Infinity)).to.equal(-1)
    expect(b.indexOf(fromString('bc'))).to.equal(1)
    expect(b.indexOf(fromString('bc'), 2)).to.equal(-1)
    expect(b.indexOf(fromString('bc'), -1)).to.equal(-1)
    expect(b.indexOf(fromString('bc'), -3)).to.equal(-1)
    expect(b.indexOf(fromString('bc'), -5)).to.equal(1)
    expect(b.indexOf(fromString('bc'), NaN)).to.equal(1)
    expect(b.indexOf(fromString('bc'), -Infinity)).to.equal(1)
    expect(b.indexOf(fromString('bc'), Infinity)).to.equal(-1)
    expect(b.indexOf(fromString('f'))).to.equal(b.length - 1)
    expect(b.indexOf(fromString('z'))).to.equal(-1)

    // empty search tests
    expect(b.indexOf(bufA)).to.equal(0)
    expect(b.indexOf(bufA, 1)).to.equal(-1)
    expect(b.indexOf(bufA, -1)).to.equal(-1)
    expect(b.indexOf(bufA, -4)).to.equal(-1)
    expect(b.indexOf(bufA, -b.length)).to.equal(0)
    expect(b.indexOf(bufA, NaN)).to.equal(0)
    expect(b.indexOf(bufA, -Infinity)).to.equal(0)
    expect(b.indexOf(bufA, Infinity)).to.equal(-1)
    expect(b.indexOf(bufBc)).to.equal(1)
    expect(b.indexOf(bufBc, 2)).to.equal(-1)
    expect(b.indexOf(bufBc, -1)).to.equal(-1)
    expect(b.indexOf(bufBc, -3)).to.equal(-1)
    expect(b.indexOf(bufBc, -5)).to.equal(1)
    expect(b.indexOf(bufBc, NaN)).to.equal(1)
    expect(b.indexOf(bufBc, -Infinity)).to.equal(1)
    expect(b.indexOf(bufBc, Infinity)).to.equal(-1)
    expect(b.indexOf(bufF)).to.equal(b.length - 1)
    expect(b.indexOf(bufZ)).to.equal(-1)
    expect(b.indexOf(Uint8Array.of(0x61))).to.equal(0)
    expect(b.indexOf(Uint8Array.of(0x61), 1)).to.equal(-1)
    expect(b.indexOf(Uint8Array.of(0x61), -1)).to.equal(-1)
    expect(b.indexOf(Uint8Array.of(0x61), -4)).to.equal(-1)
    expect(b.indexOf(Uint8Array.of(0x61), -b.length)).to.equal(0)
    expect(b.indexOf(Uint8Array.of(0x61), NaN)).to.equal(0)
    expect(b.indexOf(Uint8Array.of(0x61), -Infinity)).to.equal(0)
    expect(b.indexOf(Uint8Array.of(0x61), Infinity)).to.equal(-1)
    expect(b.indexOf(Uint8Array.of(0x0))).to.equal(-1)

    // test offsets
    expect(b.indexOf(fromString('d'), 2)).to.equal(3)
    expect(b.indexOf(fromString('f'), 5)).to.equal(5)
    expect(b.indexOf(fromString('f'), -1)).to.equal(5)
    expect(b.indexOf(fromString('f'), 6)).to.equal(-1)
  })
})
