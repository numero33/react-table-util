import {renderHook} from '@testing-library/react-hooks'

import {useFilter} from '../src'

const dataList = require('../example/dataList.json')

test('empty data/query/columnFormatter', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: [],
            query: '',
            columnFormatter: {},
        }),
    )
    expect(result.current.data.length).toBe(0)
})

test('empty query', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: '',
        }),
    )
    expect(result.current.data.length).toBe(1000)
})

test('space query', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: ' ',
        }),
    )
    expect(result.current.data.length).toBe(1000)
})

test('wrong query', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'abc',
        }),
    )
    expect(result.current.data.length).toBe(1000)
})

test('mixed and/or', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'firstName == a and lastName == b or age == 15',
        }),
    )
    expect(result.current.data.length).toBe(1000)
})

test('unknown operator', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'firstName bingo a.*',
        }),
    )
    expect(result.current.data.length).toBe(0)
})

test('simple equal number', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress === 38',
            columnFormatter: {},
        }),
    )
    expect(result.current.data.length).toBe(16)
})

test('simple equal string', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: "person.firstName === 'night 41ruc'",
        }),
    )

    expect(result.current.data.length).toBe(1)
})

test('simple not equal number', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress !== 38',
        }),
    )
    expect(result.current.data.length).toBe(984)
})

test('simple greater number', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress > 38',
        }),
    )
    expect(result.current.data.length).toBe(610)
})

test('simple equal and greater number', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress >= 38',
        }),
    )
    expect(result.current.data.length).toBe(626)
})

test('simple less number', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress < 38',
        }),
    )
    expect(result.current.data.length).toBe(374)
})

test('simple equal and less number', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress <= 38',
        }),
    )
    expect(result.current.data.length).toBe(390)
})

test('regex, fail parse flags', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress == /test',
        }),
    )
    expect(result.current.data.length).toBe(0)
})

test('regex equal number, progress starts with 3', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress == /^3\\d*$/',
        }),
    )
    expect(result.current.data.length).toBe(108)
})

test('regex equal string, firstName starts with a', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'person.firstName == /^a.*$/',
        }),
    )
    expect(result.current.data.length).toBe(58)
})

test('regex equal string, firstName contains a case insensitive', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'person.firstName == a',
        }),
    )
    expect(result.current.data.length).toBe(528)
})

test('regex equal string, firstName contains a case sensitive', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'person.firstName == /a/',
        }),
    )
    expect(result.current.data.length).toBe(527)
})

test('regex not equal number, progress starts with 3', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress != /^3\\d*$/',
        }),
    )
    expect(result.current.data.length).toBe(892)
})

test('regex not equal string, firstName starts with a', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'person.firstName != /^a.*$/',
        }),
    )
    expect(result.current.data.length).toBe(942)
})

test('simple and, firstName start with a and lastName starts with c', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'person.firstName == /^a.*$/ and person.lastName == /^c.*$/',
        }),
    )
    expect(result.current.data.length).toBe(11)
})

test('simple or, firstName start with a or lastName starts with c', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'person.firstName == /^a.*$/ or person.lastName == /^c.*$/',
        }),
    )
    expect(result.current.data.length).toBe(174)
})

test('group and/or, firstName start with a and lastName starts with c or progress starts with 3', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: '(person.firstName == /^a.*$/ and person.lastName == /^c.*$/) or progress != /^3\\d*$/',
        }),
    )
    expect(result.current.data.length).toBe(894)
})

test('group and/or, firstName start with a or lastName starts with c and progress starts with 3', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress != /^3\\d*$/ and (person.firstName == /^a.*$/ or person.lastName == /^c.*$/)',
        }),
    )
    expect(result.current.data.length).toBe(155)
})

test('group and/or, (firstName start with a and lastName starts with c or progress starts with 3) and age greater 10', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: '((person.firstName == /^a.*$/ and person.lastName == /^c.*$/) or (progress != /^3\\d*$/)) and age > 10',
        }),
    )
    expect(result.current.data.length).toBe(547)
})

test('simple equal string, columnFormatter existing column', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: `person.firstName === '${String('night 41ruc')
                .split('')
                .reverse()
                .join('')}'`,
            columnFormatter: {
                'person.firstName': x =>
                    String(x)
                        .split('')
                        .reverse()
                        .join(''),
            },
        }),
    )

    expect(result.current.data.length).toBe(1)
})

test('simple equal string, columnFormatter computed column', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: `person === '${String('night 41ruc')
                .split('')
                .reverse()
                .join('')}'`,
            columnFormatter: {
                person: x =>
                    String(x.firstName)
                        .split('')
                        .reverse()
                        .join(''),
            },
        }),
    )

    expect(result.current.data.length).toBe(1)
})

test('filter with regex key *', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: `person.firstName == '*'`,
        }),
    )

    expect(result.current.data.length).toBe(1)
})

test('filter with regex key +', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: `person.firstName == '+'`,
        }),
    )

    expect(result.current.data.length).toBe(1)
})
