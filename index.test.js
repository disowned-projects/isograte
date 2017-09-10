var isolate = require('./index').isolate
var integrate = require('./index').integrate

describe('isolate', () => {
  afterEach(() => (process.env.NODE_ENV = 'test'))
  it('should return a function', () => {
    expect(typeof isolate()).toBe('function')
  })
  test('isolated function should skip running when not on production', () => {
    const mock = jest.fn()
    const isolated = isolate(mock)
    isolated()
    expect(mock).not.toBeCalled()
  })
  test('isolated function should run on production', () => {
    process.env.NODE_ENV = 'production'
    const mock = jest.fn()
    const isolated = isolate(mock)
    isolated()
    expect(mock).toBeCalled()
  })
  test(`isolated function should run when it has __integrated prop 
      set to true`, () => {
    const mock = jest.fn()
    const isolated = isolate(mock)
    isolated()
    expect(mock).not.toBeCalled()
    isolated.__integrated = true
    isolated()
    expect(mock).toBeCalled()
  })
  test('isolated function should return defaults when skipped', () => {
    const mock = jest.fn()
    const isolated = isolate(mock, 'default value')
    expect(isolated()).toBe('default value')
    expect(mock).not.toBeCalled()
  })
  test('isolated function should set defaults to null', () => {
    const mock = jest.fn()
    const isolated = isolate(mock)
    expect(isolated()).toBe(null)
    expect(mock).not.toBeCalled()
  })
  test('isolated function should call the function with proper args', () => {
    process.env.NODE_ENV = 'production'
    const mock = jest.fn()
    const isolated = isolate(mock)
    isolated(1, 2, 3)
    expect(mock).toBeCalledWith(1, 2, 3)
  })
  test('isolated function should return the result of function call', () => {
    process.env.NODE_ENV = 'production'
    const mock = jest.fn(() => 'test')
    const isolated = isolate(mock)
    expect(isolated()).toBe('test')
  })
})

describe('integrate', () => {
  afterEach(() => (process.env.NODE_ENV = 'test'))
  it('should return a function', () => {
    expect(typeof integrate(jest.fn())).toBe('function')
  })
  it('should call the function after setting .__integrated set to true', () => {
    const mock = jest.fn(function() {
      return mock.__integrated
    })
    expect(mock()).toBe(undefined)
    expect(integrate(mock)()).toBe(true)
  })
  it('should pass arguments to the function', () => {
    const mock = jest.fn(() => 'test')
    expect(integrate(mock)(1, 2, 3)).toBe('test')
    expect(mock).toBeCalledWith(1, 2, 3)
  })
  it('should set .__integrated prop to false after running once', () => {
    const mock = jest.fn(() => mock.__integrated)
    expect(mock()).toBe(undefined)
    expect(integrate(mock)()).toBe(true)
    expect(mock()).toBe(undefined)
  })
  it('should not call other isolated functions', () => {
    const one = isolate(() => 'one')
    const two = isolate(() => 'two ' + one())
    expect(one()).toBeNull()
    expect(two()).toBeNull()
    expect(integrate(one)()).toBe('one')
    expect(integrate(two)()).toBe('two null')
    process.env.NODE_ENV = 'production'
    expect(integrate(two)()).toBe('two one')
  })
  it('should return value returned by the function', () => {
    const mock = jest.fn(() => 'test')
    expect(integrate(mock)()).toBe('test')
  })
})
