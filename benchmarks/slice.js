/* eslint-disable no-console */

/*
$ node benchmarks/slice.js
$ npx playwright-test benchmarks/slice.js --runner benchmark
*/

import Benchmark from 'benchmark'
import BufferList from 'bl/BufferList.js'
import { Uint8ArrayList } from '../dist/src/index.js'

const suite = new Benchmark.Suite()

suite
  .add('slice BufferList', () => {
    const buf = new BufferList()

    for (let j = 0; j < 10; j++) {
      buf.append(Uint8Array.from([j, 1, 2, 3, 4, 5]))
    }

    buf.slice()
  })
  .add('slice Uint8ArrayList', () => {
    const buf = new Uint8ArrayList()

    for (let j = 0; j < 10; j++) {
      buf.append(Uint8Array.from([j, 1, 2, 3, 4, 5]))
    }

    buf.slice()
  })

suite
  // add listeners
  .on('cycle', (event) => {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  // run async
  .run({ async: true })
