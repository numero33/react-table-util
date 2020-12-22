import {renderHook, act} from '@testing-library/react-hooks'

import {useSort, isSortedBy, sortDirection} from '../index'

import dataList from '../../example/dataList.json'

test('empty data', () => {
    const {result} = renderHook(() =>
        useSort({
            data: [],
        }),
    )
    expect(result.current.data).not.toBeNull()
})

test('missing inital sorting', () => {
    const {result} = renderHook(() =>
        useSort({
            data: dataList,
        }),
    )
    expect(result.current.data[0]).toStrictEqual(dataList[0])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[dataList.length - 1])
    expect(result.current.data[0]).not.toStrictEqual(dataList[1])
    expect(result.current.data.length).toBe(dataList.length)
})

test('simple sorting', () => {
    const {result} = renderHook(() =>
        useSort({
            data: dataList,
            initalSorting: {firstName: {direction: sortDirection.ascending}},
        }),
    )
    expect(result.current.data[0]).toStrictEqual(dataList[963])
    expect(result.current.data[0]).not.toStrictEqual(dataList[0])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[702])
    expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
    expect(result.current.data.length).toBe(dataList.length)
    expect(isSortedBy(result.current.sortedBy, 'firstName')).toBe(sortDirection.ascending)

    act(() => {
        result.current.onSortBy('firstName', sortDirection.none)
    })

    expect(result.current.data[0]).toStrictEqual(dataList[0])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[dataList.length - 1])
    expect(result.current.data[0]).not.toStrictEqual(dataList[1])
    expect(result.current.data.length).toBe(dataList.length)
    expect(isSortedBy(result.current.sortedBy, 'firstName')).toBe(sortDirection.none)

    act(() => {
        result.current.onSortBy('firstName', sortDirection.descending)
    })

    expect(result.current.data[0]).toStrictEqual(dataList[702])
    expect(result.current.data[0]).not.toStrictEqual(dataList[0])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[963])
    expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
    expect(result.current.data.length).toBe(dataList.length)
    expect(isSortedBy(result.current.sortedBy, 'firstName')).toBe(sortDirection.descending)

    act(() => {
        result.current.onSortBy('firstName')
    })

    expect(result.current.data[0]).toStrictEqual(dataList[963])
    expect(result.current.data[0]).not.toStrictEqual(dataList[0])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[702])
    expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
    expect(result.current.data.length).toBe(dataList.length)
    expect(isSortedBy(result.current.sortedBy, 'firstName')).toBe(sortDirection.ascending)

    act(() => {
        result.current.onSortBy('firstName')
    })

    expect(result.current.data[0]).toStrictEqual(dataList[702])
    expect(result.current.data[0]).not.toStrictEqual(dataList[0])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[963])
    expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
    expect(result.current.data.length).toBe(dataList.length)
    expect(isSortedBy(result.current.sortedBy, 'firstName')).toBe(sortDirection.descending)
})

test('simple sorting', () => {
    const extraRow = {lastName: 'missingFirstName', age: 17, visits: 27, progress: 37, status: 'complicated'}
    const updatedDataList = [...dataList.slice(0, 99), extraRow, ...dataList.slice(100)]

    const {result} = renderHook(() =>
        useSort({
            data: updatedDataList,
            initalSorting: {firstName: {direction: sortDirection.ascending}},
        }),
    )

    expect(result.current.data[0]).toStrictEqual(extraRow)
    expect(result.current.data[0]).not.toStrictEqual(dataList[0])
    expect(result.current.data[1]).toStrictEqual(dataList[963])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[702])
    expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
    expect(result.current.data.length).toBe(dataList.length)
    expect(isSortedBy(result.current.sortedBy, 'firstName')).toBe(sortDirection.ascending)
})
