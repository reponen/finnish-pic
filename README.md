# Finnish PIC validation and generation

[![Build Status](https://travis-ci.org/vkomulai/finnish-pic.svg?branch=master)](https://travis-ci.org/vkomulai/finnish-pic) ![0 deps](https://david-dm.org/vkomulai/finnish-pic.svg) ![Downloads](https://img.shields.io/npm/dt/finnish-pic.svg) ![License](https://img.shields.io/npm/l/finnish-pic.svg)

- A micro Javascript library for validating and generating Finnish personal identity codes
- Zero dependencies

## Installation

```sh
npm install finnish-pic --save
```

## Usage

ES6 / TypeScript

```js
import { FinnishPIC } from 'finnish-pic'
const isValid = FinnishPIC.validate('010101-100X')
console.log(isValid) //  Yields true
```

## Examples

Validate a PIC

```js
//  This is a valid PIC
console.log('A valid pic returns ' + FinnishPIC.validate('290296-7808'))
//  'valid pic returns true'

//  This is an invalid PIC
console.log('An invalid pic returns ' + FinnishPIC.validate('010198-1000'))
//  'invalid pic returns false'
```

Parse PIC

```js
//  This is a valid PIC
var parsedSsn =  FinnishPIC.parse('290296-7808')
console.log(parsedSsn)
{
  valid: true,
  sex: 'female',
  ageInYears: 19,
  dateOfBirth: Thu Feb 29 1996 00:00:00 GMT+0200 (EET)
}
```

Create a PIC for person that is 20 years old.

```js
console.log('PIC for person that is 20 years old ' + FinnishPIC.createWithAge(20))
//  PIC for person that is 20 years old 010195-XXXX
```

## Functions

### #validate(pic)

- Validates a given PIC. Returns true if a PIC is valid, otherwise false

### #parse(pic)

- Parses a given PIC. Returns object `{valid: boolean, sex: "male|female", ageInYears: Number, dateOfBirth: Date }`

```js
{
  valid: false,
  sex: null,
  ageInYears: null,
  dateOfBirth: null
}
{
  valid: true,
  sex: 'male',
  ageInYears: 15,
  dateOfBirth: Tue Feb 29 2000 00:00:00 GMT+0200 (EET)
}
{
  valid: true,
  sex: 'female',
  ageInYears: 15,
  dateOfBirth: Mon Feb 28 2000 00:00:00 GMT+0200 (EET)
}
```

### #createWithAge(age)

- Creates a valid PIC using the given age (Integer). Generates randomly male and female PICs.

## Building

```sh
npm run dist

# Run tests
npm run test

# Run tests in watch-mode
npm run test:watch
```

## Changelog

### 2.0.3

- FIXED: [Issue 6: Wrong SSN validation](https://github.com/vkomulai/finnish-ssn/issues/9)

### 2.0.2

- Using TypeScript
- Minor version in x.y.2 thanks to hazzle with npm publish and artifacts

### 1.2.0

- Generate SSNs with random month and day for given age. Also takes into account whether the randomized birth date has already passed and adjusts birth year accordingly, so that the returned SSN really has the given age on the day of generation.

### 1.1.1

- FIXED: [Issue 6: Bug in calculating age](https://github.com/vkomulai/finnish-ssn/issues/6)

### 1.1.0

- Sources ported from ES5 --> ES6
- Distributed js is transpiled to ES5 for backwards compatibility
- API should still be backwards compatible with `1.0.3`. Bumping minor-version to be on the safe side.

### 1.0.3

- FIXED: [Issue 2: Replace npmcdn.com with unpkg.com](https://github.com/vkomulai/finnish-ssn/issues/2)

### 1.0.2

- FIXED: [Issue 1: Length is not verified](https://github.com/vkomulai/finnish-ssn/issues/1)

### 1.0.1

- Clean semicolons, removed lodash

### 1.0.0

- Initial release

## License

[MIT License](LICENSE)
