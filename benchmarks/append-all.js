/* eslint-disable no-console */

/*
$ node benchmarks/append.js
$ npx playwright-test benchmarks/append.js --runner benchmark
*/

import Benchmark from 'benchmark'
import BufferList from 'bl/BufferList.js'
import { Uint8ArrayList } from '../dist/src/index.js'

const bufs = []
for (let j = 0; j < 10; j++) {
  bufs.push(Uint8Array.from([j, 1, 2, 3, 4, 5]))
}

const suite = new Benchmark.Suite()

suite
  .add('append BufferList', () => {
    const list = new BufferList()

    list.append(bufs)
  })
  .add('appendAll Uint8ArrayList', () => {
    const list = new Uint8ArrayList()

    list.appendAll(bufs)
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
