import {useState, useMemo, useCallback} from 'react'
import flat, {unflatten} from 'flat'
import rowFormatter from './columnFormatter'

type dataArrayRow = {[columnName: string]: unknown}
type dataArray = Array<dataArrayRow>
interface useSortProps<T> {
    data: Array<T>
    initalSorting?: sortedBy
    columnFormatter?: {[columnName: string]: (value: any) => any}
}

export enum sortDirection {
    none,
    ascending,
    descending,
}

interface sortedBy {
    [propName: string]: sortByProps
}
interface sortByProps {
    direction: sortDirection
}

interface useSortReturn<T> {
    data: Array<T>
    onSortBy: (key: string, direction?: sortDirection) => void
    sortedBy?: sortedBy
}

export function useSort<T>(props: useSortProps<T>): useSortReturn<T> {
    const {data, initalSorting, columnFormatter} = props

    const [sortedBy, setSortedBy] = useState<sortedBy | undefined>(initalSorting)

    const flatArray: dataArray = useMemo(() => data.flatMap(x => flat(x)), [data])

    const neededColumnFormatters: {[columnName: string]: (value: unknown) => void} = useMemo(() => {
        if (columnFormatter === undefined || sortedBy === undefined) return {}
        const c = Object.keys(columnFormatter).filter(x => Object.keys(sortedBy).includes(x))
        if (c.length === 0) return {}
        return c.reduce((sum, val) => ({...sum, [val]: columnFormatter[val]}), {})
    }, [columnFormatter, sortedBy])

    const formatRowFlat = useCallback((row: any) => rowFormatter(row, neededColumnFormatters), [neededColumnFormatters])

    const onSortBy = (key: string, direction?: sortDirection): void => {
        if (direction === sortDirection.none) setSortedBy(undefined)
        else setSortedBy(x => ({[key]: {direction: direction || toggleSortDirection((x || {})[key])}}))
    }

    const sortedArray = useMemo(() => {
        let sortedFlatArray: dataArray = flatArray
        if (sortedBy !== undefined) {
            sortedFlatArray = Object.keys(sortedBy).flatMap(k =>
                sortedFlatArray.sort((a: any, b: any): number => {
                    ;[a, b] = [formatRowFlat(a), formatRowFlat(b)]
                    if (sortedBy[k].direction > 1) [a, b] = [b, a]
                    return defaultCompare(a[k] || '', b[k] || '')
                }),
            )
            return sortedFlatArray.flatMap<T>(x => unflatten(x))
        }
        return undefined
    }, [flatArray, sortedBy, formatRowFlat])

    return {
        data: sortedArray ?? data,
        onSortBy,
        sortedBy,
    }
}

export function isSortedBy(sortedBy: sortedBy | undefined, key: string): sortDirection {
    return sortedBy !== undefined && sortedBy.hasOwnProperty(key) ? sortedBy[key].direction : sortDirection.none
}

const toggleSortDirection = (prevState: sortByProps | undefined) => (prevState !== undefined && prevState.direction === sortDirection.ascending ? sortDirection.descending : sortDirection.ascending)

const defaultCompare = (a: any, b: any): number => {
    return a === b ? 0 : a > b ? 1 : -1
}
