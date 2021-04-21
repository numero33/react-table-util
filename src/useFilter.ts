import {useCallback, useMemo} from 'react'
import {filterConjunctive, QueryGroup} from './queryGroup'
import flat, {unflatten} from 'flat'

interface useFilterProps<T> {
    data: Array<T>
    query: string
    columnFormatter?: {[columnName: string]: (value: unknown) => void}
}

interface useFilterReturn<T> {
    data: Array<T>
}

const reBrace = /\(((?!(\(|\))).)*\)/gim
const reCondition = /^\s*(\S+)\s+(\S+)\s+(\'.*\'|\S+)\s*|\s*sq(\d+)\s*$/
const reReplaceBrace = /^\s*\(+\s*|\s*\)+\s*$/g
const reReplaceApostrophe = /^\s*\'*|\'*\s*$/g
const reSplit = /\s+(and|or)\s+/gim

export function useFilter<T>(props: useFilterProps<T>): useFilterReturn<T> {
    const {data, query, columnFormatter} = props

    const formatRow = useCallback(
        row => {
            if (columnFormatter === undefined) return row
            const keys = Object.keys(columnFormatter)
            if (keys.length === 0) return row
            const tmp = {...row}
            for (const c of keys) if (c in tmp) tmp[c] = columnFormatter[c](row[c])
            return tmp
        },
        [columnFormatter],
    )

    const queryFilter: QueryGroup | null = useMemo(() => {
        const trimQuery = query.trim()
        if (trimQuery.length === 0) return null

        const subQuerys: Array<QueryGroup> = []
        let newQuery: string = '(' + trimQuery + ')'
        while (newQuery.includes('(')) {
            const matches = newQuery.matchAll(reBrace)

            let result = matches.next()
            while (!result.done) {
                const m = result.value[0].replace(reReplaceBrace, '')

                // if (m.includes('and') && m.includes('or')) return {data: [], error: Error('mixed and/or')}
                if (/\s+and\s+/gim.test(m) && /\s+or\s+/gim.test(m)) return null

                const group = new QueryGroup(m.includes('and') ? filterConjunctive.and : filterConjunctive.or)
                for (const c of m.split(reSplit)) {
                    const s = reCondition.exec(c)
                    if (s !== null) {
                        if (s[1] !== undefined) group.addCompare(s[1], s[2], s[3].replace(reReplaceApostrophe, ''))
                        else if (s[4] !== undefined) group.addGroup(subQuerys[Number(s[4])])
                    }
                }

                newQuery = newQuery.replace(result.value[0], 'sq' + subQuerys.length)
                if (group.parts.length > 0) subQuerys.push(group)
                result = matches.next()
            }
        }

        if (subQuerys.length === 0) return null
        return subQuerys[subQuerys.length - 1]
    }, [query])

    const flatArray: Array<T> = useMemo(() => data.flatMap(x => flat(x)), [data])

    const newData: Array<T> | undefined = useMemo(() => {
        if (queryFilter !== null) return flatArray.filter(x => queryFilter.filter(formatRow(x))).flatMap(x => unflatten(x))
        return undefined
    }, [flatArray, queryFilter, formatRow])

    return {
        data: newData ?? data,
    }
}
