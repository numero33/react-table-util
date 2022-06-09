import {useState, useMemo, useCallback} from 'react'
import flat, {unflatten} from 'flat'
import rowFormatter, {FlatRow, FlatRowValue, sortingColumnFormatters} from './columnFormatter'

interface useSortProps<T> {
    data: Array<T>
    initalSorting?: sortedBy
    columnFormatter?: sortingColumnFormatters
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

    const flatArray: FlatRow[] = useMemo(() => data.flatMap(x => flat(x)), [data])

    const neededColumnFormatters: sortingColumnFormatters = useMemo(() => {
        if (columnFormatter === undefined || sortedBy === undefined) return {}
        const c = Object.keys(columnFormatter).filter(x => Object.keys(sortedBy).includes(x))
        if (c.length === 0) return {}
        return c.reduce((sum, val) => ({...sum, [val]: columnFormatter[val]}), {})
    }, [columnFormatter, sortedBy])

    const formatRowFlat = useCallback((row: FlatRow): FlatRow => rowFormatter(row, neededColumnFormatters) as FlatRow, [neededColumnFormatters])

    const onSortBy = (key: string, direction?: sortDirection): void => {
        if (direction === sortDirection.none) setSortedBy(undefined)
        else setSortedBy(x => ({[key]: {direction: direction ?? toggleSortDirection((x ?? {})[key])}}))
    }

    const sortedArray = useMemo(() => {
        let sortedFlatArray = flatArray
        if (sortedBy !== undefined) {
            sortedFlatArray = Object.keys(sortedBy).flatMap(k =>
                sortedFlatArray.sort((a, b): number => {
                    ;[a, b] = [formatRowFlat(a), formatRowFlat(b)]
                    if (sortedBy[k].direction > 1) [a, b] = [b, a]
                    return defaultCompare(a[k] ?? '', b[k] ?? '')
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

const defaultCompare = (a: FlatRowValue, b: FlatRowValue): number => {
    return a === b ? 0 : a > b ? 1 : -1
}
