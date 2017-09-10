var isograte = require('./index')

var isolate = isograte.isolate
var integrate = isograte.integrate

const mock = {
  one: function() {
    throw new Error('Called one')
  },
  two: function() {
    throw new Error('Called two')
  }
}

function impureOne(x) {
  return mock.one(x)
}

var isolatedOne = isolate(impureOne, 'one')

function impureTwo(x) {
  isolatedOne()
  return mock.two(x)
}

var isolatedTwo = isolate(impureTwo, 'two')

if (isolatedOne() !== 'one') {
  throw new Error('improper return value')
}

if (isolatedTwo() !== 'two') {
  throw new Error('improper return value')
}

mock.one = function(x) {
  return x
}

mock.two = function(x) {
  return x
}


var _impureOne = integrate(isolatedOne)
var _impureTwo = integrate(isolatedTwo)

if(_impureOne(2) !== 2) {
  console.log(_impureOne(2))
  throw new Error('Integration failed')
}
mock.one = function() {
  throw new Error('should not call this')
}
if (_impureTwo(2) !== 2) {
  console.log(_impureTwo(2))
  throw new Error('Integration failed')
}
if (isolatedOne() !== 'one') {
  throw new Error('improper return value')
}

if (isolatedTwo() !== 'two') {
  throw new Error('improper return value')
}

console.log('Passed all integration tests')