import BufferList from 'bl/BufferList.js'
import { Uint8ArrayList } from '../dist/src/index.js'

const REPEAT = 10000

const testCases = [
  { name: 'BufferList', factoryFn: () => new BufferList() },
  { name: 'Uint8ArrayList', factoryFn: () => new Uint8ArrayList() }
]

for (const { name, factoryFn } of testCases) {
  const start = Date.now()
  for (let i = 0; i < REPEAT; i++) {
    const buf = factoryFn()

    for (let j = 0; j < REPEAT; j++) {
      buf.append(Buffer.from([i, j, 1, 2, 3, 4, 5]))
      buf.slice()
      buf.consume(buf.length)
    }
  }

  console.info(`${name} - slice() spanning 1 buffer`, Date.now() - start, 'ms') // eslint-disable-line no-console
}

for (const { name, factoryFn } of testCases) {
  const start = Date.now()
  for (let i = 0; i < REPEAT; i++) {
    const buf = factoryFn()

    for (let j = 0; j < REPEAT; j++) {
      buf.append(Buffer.from([i, j, 1, 2, 3, 4, 5]))
      buf.append(Buffer.from([i, j, 1, 2, 3, 4, 5]))
      buf.slice()
      buf.consume(buf.length)
    }
  }

  console.info(`${name} - slice() spanning 2 buffers`, Date.now() - start, 'ms') // eslint-disable-line no-console
}
