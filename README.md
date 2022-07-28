# uint8arraylist <!-- omit in toc -->

[![codecov](https://img.shields.io/codecov/c/github/achingbrain/uint8arraylist.svg?style=flat-square)](https://codecov.io/gh/achingbrain/uint8arraylist)
[![CI](https://img.shields.io/github/workflow/status/achingbrain/uint8arraylist/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/achingbrain/uint8arraylist/actions/workflows/js-test-and-release.yml)

> Append and consume bytes using only no-copy operations

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
- [Inspiration](#inspiration)
- [License](#license)
- [Contribution](#contribution)

## Install

```console
$ npm i uint8arraylist
```

## Usage

```js
import { Uint8ArrayList } from 'uint8arraylist'

const list = new Uint8ArrayList()
list.append(Uint8Array.from([0, 1, 2]))
list.append(Uint8Array.from([3, 4, 5]))

list.toUint8Array()
// -> Uint8Array([0, 1, 2, 3, 4, 5])

list.consume(3)
list.toUint8Array()
// -> Uint8Array([3, 4, 5])

// you can also iterate over the list
for (const buf of list) {
  // ..do something with `buf`
}

list.slice(0, 1)
// -> Uint8ArrayList([0])
```

## Inspiration

Borrows liberally from [bl](https://www.npmjs.com/package/bl) but only uses native JS types.

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
