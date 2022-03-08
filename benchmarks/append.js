import BufferList from 'bl/BufferList.js'
import { Uint8ArrayList } from '../dist/src/index.js'

const REPEAT = 1000
let start = Date.now()

for (let i = 0; i < REPEAT; i++) {
  const buf = new BufferList()

  for (let j = 0; j < REPEAT; j++) {
    buf.append(Uint8Array.from([i, j, 1, 2, 3, 4, 5]))
  }

  buf.slice()
}

console.info('BufferList', Date.now() - start, 'ms') // eslint-disable-line no-console

start = Date.now()

for (let i = 0; i < REPEAT; i++) {
  const buf = new Uint8ArrayList()

  for (let j = 0; j < REPEAT; j++) {
    buf.append(Uint8Array.from([i, j, 1, 2, 3, 4, 5]))
  }

  buf.toUint8Array()
}

console.info('Uint8ArrayList', Date.now() - start, 'ms') // eslint-disable-line no-console
