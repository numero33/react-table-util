import {useState, useMemo} from 'react'
import flat, {unflatten} from 'flat'

interface useSortProps {
    data: Array<unknown>
    initalSorting?: sortedBy
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

interface useSortReturn {
    data: Array<unknown>
    onSortBy: (key: string, direction?: sortDirection) => void
    sortedBy?: sortedBy
}

export function useSort(props: useSortProps): useSortReturn {
    const {data, initalSorting} = props

    const [sortedBy, setSortedBy] = useState<sortedBy | undefined>(initalSorting)

    const flatArray: Array<unknown> = useMemo(() => data.flatMap(x => flat(x)), [data])

    const onSortBy = (key: string, direction?: sortDirection): void => {
        if (direction === sortDirection.none) setSortedBy(undefined)
        else setSortedBy(x => ({[key]: {direction: direction || toggleSortDirection((x || {})[key])}}))
    }

    const sortedArray = useMemo(() => {
        let sortedFlatArray: Array<unknown> = flatArray
        if (sortedBy !== undefined) {
            sortedFlatArray = Object.keys(sortedBy).flatMap(k =>
                sortedFlatArray.sort((a: any, b: any): number => {
                    if (sortedBy[k].direction > 1) [a, b] = [b, a]
                    return defaultCompare(a[k] || '', b[k] || '')
                }),
            )
            return sortedFlatArray.flatMap(x => unflatten(x))
        }
        return undefined
    }, [flatArray, sortedBy])

    return {
        data: sortedArray || data,
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
