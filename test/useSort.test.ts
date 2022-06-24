import {renderHook, act} from '@testing-library/react'

import {useSort, isSortedBy, sortDirection} from '../src'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dataList = require('../example/dataList.json')

test('empty data', () => {
    const {result} = renderHook(() =>
        useSort({
            data: [],
        }),
    )
    expect(result.current.data).not.toBeNull()
})

test('without inital sorting', () => {
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

test('auto toggle sorting', async () => {
    const {result} = renderHook(() =>
        useSort({
            data: dataList,
        }),
    )
    await act(() => result.current.onSortBy('person.firstName'))

    expect(result.current.data[0]).toStrictEqual(dataList[963])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[702])

    await act(() => result.current.onSortBy('person.firstName'))

    expect(result.current.data[0]).toStrictEqual(dataList[702])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[963])
})

describe('simple sorting', () => {
    test('onSortBy', () => {
        const {result} = renderHook(() =>
            useSort({
                data: dataList,
                initalSorting: {'person.firstName': {direction: sortDirection.ascending}},
            }),
        )
        expect(result.current.data[0]).toStrictEqual(dataList[963])
        expect(result.current.data[0]).not.toStrictEqual(dataList[0])
        expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[702])
        expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
        expect(result.current.data.length).toBe(dataList.length)
        expect(isSortedBy(result.current.sortedBy, 'person.firstName')).toBe(sortDirection.ascending)

        act(() => {
            result.current.onSortBy('person.firstName', sortDirection.none)
        })

        expect(result.current.data[0]).toStrictEqual(dataList[0])
        expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[dataList.length - 1])
        expect(result.current.data[0]).not.toStrictEqual(dataList[1])
        expect(result.current.data.length).toBe(dataList.length)
        expect(isSortedBy(result.current.sortedBy, 'person.firstName')).toBe(sortDirection.none)

        act(() => {
            result.current.onSortBy('person.firstName', sortDirection.descending)
        })

        expect(result.current.data[0]).toStrictEqual(dataList[702])
        expect(result.current.data[0]).not.toStrictEqual(dataList[0])
        expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[963])
        expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
        expect(result.current.data.length).toBe(dataList.length)
        expect(isSortedBy(result.current.sortedBy, 'person.firstName')).toBe(sortDirection.descending)

        act(() => {
            result.current.onSortBy('person.firstName')
        })

        expect(result.current.data[0]).toStrictEqual(dataList[963])
        expect(result.current.data[0]).not.toStrictEqual(dataList[0])
        expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[702])
        expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
        expect(result.current.data.length).toBe(dataList.length)
        expect(isSortedBy(result.current.sortedBy, 'person.firstName')).toBe(sortDirection.ascending)

        act(() => {
            result.current.onSortBy('person.firstName')
        })

        expect(result.current.data[0]).toStrictEqual(dataList[702])
        expect(result.current.data[0]).not.toStrictEqual(dataList[0])
        expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[963])
        expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
        expect(result.current.data.length).toBe(dataList.length)
        expect(isSortedBy(result.current.sortedBy, 'person.firstName')).toBe(sortDirection.descending)
    })

    test('missing field', () => {
        const extraRow = {person: {lastName: 'missingFirstName'}, age: 17, visits: 27, progress: 37, status: 'complicated'}
        const updatedDataList = [...dataList.slice(0, 99), extraRow, ...dataList.slice(100)]

        const {result} = renderHook(() =>
            useSort({
                data: updatedDataList,
                initalSorting: {'person.firstName': {direction: sortDirection.ascending}},
            }),
        )

        expect(result.current.data[0]).toStrictEqual(extraRow)
        expect(result.current.data[0]).not.toStrictEqual(dataList[0])
        expect(result.current.data[1]).toStrictEqual(dataList[963])
        expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[702])
        expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
        expect(result.current.data.length).toBe(dataList.length)
        expect(isSortedBy(result.current.sortedBy, 'person.firstName')).toBe(sortDirection.ascending)
    })
})

describe('multiple sort', () => {
    test('init sorting', () => {
        const data = [
            {
                age: 1,
                visits: 0,
            },
            {
                age: 1,
                visits: 15,
            },
            {
                age: 1,
                visits: 30,
            },
            {
                age: 1,
                visits: 99,
                progress: -4,
            },
            {
                age: 1,
                visits: 99,
                progress: 1,
            },

            {
                age: 5,
                visits: 1,
            },
            {
                age: 99,
                visits: 1,
            },
            {
                age: 99,
                visits: 50,
            },
            {
                age: 99,
                visits: 100,
            },
        ]

        const {result} = renderHook(() =>
            useSort({
                data: [...data].sort(() => Math.random() - 0.5),
                initalSorting: {
                    age: {direction: sortDirection.ascending},
                    visits: {direction: sortDirection.ascending},
                    progress: {direction: sortDirection.ascending},
                },
            }),
        )

        expect(result.current.data).toStrictEqual(data)
        // expect(isSortedBy(result.current.sortedBy, 'person.firstName')).toBe(sortDirection.ascending)
    })
})

test('sorting columnFormatter existing column', () => {
    const {result} = renderHook(() =>
        useSort({
            data: dataList,
            initalSorting: {'person.firstName': {direction: sortDirection.ascending}},
            columnFormatter: {
                'person.firstName': x => String(x).split('').reverse().join(''),
                'person.nothingtoformat': x => x,
            },
        }),
    )

    expect(result.current.data[0]).toStrictEqual(dataList[523])
    expect(result.current.data[0]).not.toStrictEqual(dataList[0])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[641])
    expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
    expect(result.current.data.length).toBe(dataList.length)
    expect(isSortedBy(result.current.sortedBy, 'person.firstName')).toBe(sortDirection.ascending)
})

test('sorting columnFormatter computed column', () => {
    const {result} = renderHook(() =>
        useSort({
            data: dataList,
            initalSorting: {person: {direction: sortDirection.ascending}},
            columnFormatter: {
                person: x => String(x.firstName).split('').reverse().join(''),
                'person.nothingtoformat': x => x,
            },
        }),
    )

    expect(result.current.data[0]).toStrictEqual(dataList[523])
    expect(result.current.data[0]).not.toStrictEqual(dataList[0])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[641])
    expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
    expect(result.current.data.length).toBe(dataList.length)
    expect(isSortedBy(result.current.sortedBy, 'person')).toBe(sortDirection.ascending)
})

test('sorting columnFormatter empty keys', () => {
    const {result} = renderHook(() =>
        useSort({
            data: dataList,
            initalSorting: {'person.firstName': {direction: sortDirection.ascending}},
            columnFormatter: {},
        }),
    )

    expect(result.current.data[0]).toStrictEqual(dataList[963])
    expect(result.current.data[0]).not.toStrictEqual(dataList[0])
    expect(result.current.data[result.current.data.length - 1]).toStrictEqual(dataList[702])
    expect(result.current.data[result.current.data.length - 1]).not.toStrictEqual(dataList[dataList.length - 1])
    expect(result.current.data.length).toBe(dataList.length)
    expect(isSortedBy(result.current.sortedBy, 'person.firstName')).toBe(sortDirection.ascending)
})
