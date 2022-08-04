/* eslint-disable no-console */

/*
$ node benchmarks/sublist.js
$ npx playwright-test benchmarks/sublist.js --runner benchmark
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
  .add('shallowSlice BufferList', () => {
    const list = new BufferList(bufs)
    list.shallowSlice()
    list.shallowSlice(3, 10)
  })
  .add('sublist Uint8ArrayList', () => {
    const list = new Uint8ArrayList(...bufs)
    list.sublist()
    list.sublist(3, 10)
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
