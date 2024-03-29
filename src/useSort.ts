import {useState, useMemo, useCallback} from 'react'
import {flatten, unflatten} from 'flat'
import rowFormatter, {FlatRow, FlatRowValue, sortingColumnFormatters} from './columnFormatter'

export interface useSortProps<T, CN extends string> {
    data: Array<T>
    initalSorting?: sortedBy
    columnFormatter?: sortingColumnFormatters<CN>
}

export enum sortDirection {
    none,
    ascending,
    descending,
}

export interface sortedBy {
    [propName: string]: sortByProps
}
export interface sortByProps {
    direction: sortDirection
}

export interface useSortReturn<T> {
    data: Array<T>
    onSortBy: (key: string, direction?: sortDirection) => void
    sortedBy?: sortedBy
}

export function useSort<T, CN extends string>({data, initalSorting, columnFormatter: initalColumnFormatter}: useSortProps<T, CN>): useSortReturn<T> {
    const [columnFormatter] = useState(initalColumnFormatter)

    const [sortedBy, setSortedBy] = useState<sortedBy | undefined>(initalSorting)

    const flatArray: FlatRow[] = useMemo(() => data.flatMap(x => flatten(x)), [data])

    const neededColumnFormatters = useMemo<sortingColumnFormatters<CN>>(() => {
        if (columnFormatter === undefined || sortedBy === undefined) return {}
        const c = (Object.keys(columnFormatter) as CN[]).filter(x => Object.keys(sortedBy).includes(x))
        if (c.length === 0) return {}
        return c.reduce((sum, val) => ({...sum, [val]: columnFormatter[val]}), {})
    }, [columnFormatter, sortedBy])

    const onSortBy = useCallback((key: string, direction?: sortDirection): void => {
        if (direction === sortDirection.none) setSortedBy(undefined)
        else setSortedBy(x => ({[key]: {direction: direction ?? toggleSortDirection((x ?? {})[key])}}))
    }, [])

    const formatRowFlat = useCallback((row: FlatRow): FlatRow => rowFormatter(row, neededColumnFormatters) as FlatRow, [neededColumnFormatters])

    const sortedArray = useMemo(
        () =>
            sortGroup([...flatArray], sortedBy ? Object.keys(sortedBy).map(x => ({...sortedBy[x], key: x})) : [], formatRowFlat).flatMap<T>(x => unflatten(x)),
        [flatArray, sortedBy, formatRowFlat],
    )

    return {
        data: sortedArray,
        onSortBy,
        sortedBy,
    }
}

export function isSortedBy(sortedBy: sortedBy | undefined, key: string): sortDirection {
    return sortedBy !== undefined && sortedBy.hasOwnProperty(key) ? sortedBy[key].direction : sortDirection.none
}

const toggleSortDirection = (prevState: sortByProps | undefined) =>
    prevState !== undefined && prevState.direction === sortDirection.ascending ? sortDirection.descending : sortDirection.ascending

const defaultCompare = (a: FlatRowValue, b: FlatRowValue): number => {
    return a === b ? 0 : a > b ? 1 : -1
}

const sortGroup = (group: FlatRow[], sortedBy: (sortByProps & {key: string})[], formatRowFlat: (row: FlatRow) => FlatRow): FlatRow[] => {
    // nothing todo
    const sortBy = sortedBy.shift()
    if (group.length <= 1 || !sortBy) return group

    group = group.sort((a, b): number => {
        ;[a, b] = [formatRowFlat(a), formatRowFlat(b)]
        if (sortBy.direction > 1) [a, b] = [b, a]
        return defaultCompare(a[sortBy.key] ?? '', b[sortBy.key] ?? '')
    })

    // nothing to sort again
    if (sortedBy.length === 0) return group

    type GroupBy = {
        [key: string]: FlatRow[]
    }

    return Object.values(
        group.reduce<GroupBy>((prev, cur) => {
            prev[cur[sortBy.key]] = prev?.[cur[sortBy.key]] ?? ([] as FlatRow[])
            prev[cur[sortBy.key]].push(cur)
            return prev
        }, {}),
    ).flatMap(x => sortGroup(x, [...sortedBy], formatRowFlat))
}
