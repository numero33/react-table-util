import {renderHook} from '@testing-library/react-hooks'

import {useFilter} from '../index'

import dataList from './dataList.json'

test('empty data/query', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: [],
            query: '',
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
        }),
    )
    expect(result.current.data.length).toBe(16)
})

test('simple equal string', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: "firstName === 'night 41ruc'",
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

test('regex equal number, progress starts with 3', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress == 3\\d*',
        }),
    )
    expect(result.current.data.length).toBe(108)
})

test('regex equal string, firstName starts with a', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'firstName == a.*',
        }),
    )
    expect(result.current.data.length).toBe(58)
})

test('regex not equal number, progress starts with 3', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress != 3\\d*',
        }),
    )
    expect(result.current.data.length).toBe(892)
})

test('regex not equal string, firstName starts with a', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'firstName != a.*',
        }),
    )
    expect(result.current.data.length).toBe(942)
})

test('simple and, firstName start with a and lastName starts with c', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'firstName == a.* and lastName == c.*',
        }),
    )
    expect(result.current.data.length).toBe(11)
})

test('simple or, firstName start with a or lastName starts with c', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'firstName == a.* or lastName == c.*',
        }),
    )
    expect(result.current.data.length).toBe(174)
})

test('group and/or, firstName start with a and lastName starts with c or progress starts with 3', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: '(firstName == a.* and lastName == c.*) or progress != 3\\d*',
        }),
    )
    expect(result.current.data.length).toBe(894)
})

test('group and/or, firstName start with a or lastName starts with c and progress starts with 3', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: 'progress != 3\\d* and (firstName == a.* or lastName == c.*)',
        }),
    )
    expect(result.current.data.length).toBe(155)
})

test('group and/or, (firstName start with a and lastName starts with c or progress starts with 3) and age greater 10', () => {
    const {result} = renderHook(() =>
        useFilter({
            data: dataList,
            query: '((firstName == a.* and lastName == c.*) or (progress != 3\\d*)) and age > 10',
        }),
    )
    expect(result.current.data.length).toBe(547)
})
