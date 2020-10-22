import {useState, useMemo} from 'react'
import flat, {unflatten} from 'flat'

interface useSortProps {
    data: Array<unknown>
    initalSorting: sortedBy
}

enum sortDirection {
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

interface useSortReturn {
    data: Array<unknown>
    onSortBy: (key: string, direction: sortDirection) => void
    sortedBy: sortedBy | null
}

export function useSort(props: useSortProps): useSortReturn {
    const {data, initalSorting} = props
    const flatArray = useMemo(() => data.flatMap(x => flat(x)), [data])

    const [sortedBy, setSortedBy] = useState<sortedBy | null>(initalSorting || null)

    const onSortBy = (key: string, direction: sortDirection): void => {
        setSortedBy(x => ({[key]: {direction: direction || toggleSortDirection((x || {})[key])}}))
    }

    const sortedArray = useMemo(() => {
        let sortedFlatArray: Array<unknown> = flatArray
        if (sortedBy !== null) {
            sortedFlatArray = Object.keys(sortedBy).flatMap(k =>
                sortedFlatArray.sort((a: any, b: any): number => {
                    if (sortedBy[k].direction > 1) [a, b] = [b, a]
                    return defaultCompare(a[k] || '', b[k] || '')
                }),
            )
        }
        return sortedFlatArray.flatMap(x => unflatten(x))
    }, [flatArray, sortedBy])

    return {
        data: sortedArray,
        onSortBy,
        sortedBy,
    }
}

export function isSortedBy(sortedBy: sortedBy, key: string): sortDirection {
    return sortedBy !== null && sortedBy.hasOwnProperty(key) ? sortedBy[key].direction : 0
}

const toggleSortDirection = (prevState: sortByProps | undefined) => (prevState !== undefined && prevState.direction === 1 ? 2 : 1)

const defaultCompare = (a: any, b: any): number => {
    return a === b ? 0 : a > b ? 1 : -1
}
