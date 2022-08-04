/*
$ node benchmarks/sublist.js
$ npx playwright-test benchmarks/sublist.js --runner benchmark
*/

import Benchmark from 'benchmark'
import BufferList from 'bl/BufferList.js'
import { Uint8ArrayList } from '../dist/src/index.js'

const suite = new Benchmark.Suite()

suite
  .add('shallowSlice BufferList', () => {
    const buf = new BufferList()
    buf.append(Uint8Array.from([0, 1, 2, 3, 4, 5]))
    buf.append(Uint8Array.from([6, 7, 8, 9, 10, 11]))
    buf.shallowSlice()
    buf.shallowSlice(3, 10)
  })
  .add('sublist Uint8ArrayList', () => {
    const buf = new Uint8ArrayList()
    buf.append(Uint8Array.from([0, 1, 2, 3, 4, 5]))
    buf.append(Uint8Array.from([6, 7, 8, 9, 10, 11]))
    buf.sublist()
    buf.sublist(3, 10)
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
