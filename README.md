# Uint8ArrayList

> Append and consume bytes using only no-copy operations

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
