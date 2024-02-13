import {useMemo, useCallback, useState} from 'react'
import {FilterConjunctive, Operator, QueryGroup} from './queryGroup'
import flat from 'flat'
import rowFormatter, {filterColumnFormatters, FlatRowFilter, FlatRowValueFilter} from './columnFormatter'

export interface useFilterProps<T, CN extends string> {
    data: T[]
    query: string
    columnFormatter?: filterColumnFormatters<CN>
    queryValueFormatter?: filterColumnFormatters<CN>
}

export interface useFilterReturn<T> {
    data: T[]
}

const reBrace = /\(((?!(\(|\))).)*\)/gim
const reCondition = /^\s*(\S+)\s+(\S+)\s+(\'.*\'|\S+)\s*|\s*sq(\d+)\s*$/
const reReplaceBrace = /^\s*\(+\s*|\s*\)+\s*$/g
const reReplaceApostrophe = /^\s*\'*|\'*\s*$/g
const reSplit = /\s+(and|or)\s+/gim

export function useFilter<T, CN extends string>({
    data,
    query,
    columnFormatter: initalColumnFormatter,
    queryValueFormatter: initalQueryValueFormatter,
}: useFilterProps<T, CN>): useFilterReturn<T> {
    const [columnFormatter] = useState(initalColumnFormatter)
    const [queryValueFormatter] = useState(initalQueryValueFormatter)

    const queryFilter: QueryGroup | null = useMemo(() => {
        const trimQuery = query.trim()
        if (trimQuery.length === 0) return null

        const subQuerys: QueryGroup[] = []
        let newQuery: string = '(' + trimQuery + ')'
        while (newQuery.match(reBrace)) {
            const matches = newQuery.matchAll(reBrace)

            let result = matches.next()
            while (!result.done) {
                const m = result.value[0].replace(reReplaceBrace, '')

                // if (m.includes('and') && m.includes('or')) return {data: [], error: Error('mixed and/or')}
                if (/\s+and\s+/gim.test(m) && /\s+or\s+/gim.test(m)) return null

                const group = new QueryGroup(m.includes('and') ? FilterConjunctive.And : FilterConjunctive.Or)
                for (const c of m.split(reSplit)) {
                    const s = reCondition.exec(c)
                    if (s !== null) {
                        if (s[1] !== undefined) {
                            let value = s[3].replace(reReplaceApostrophe, '') as FlatRowValueFilter
                            if (queryValueFormatter !== undefined && s[1] in queryValueFormatter) {
                                const f = queryValueFormatter[s[1] as keyof typeof queryValueFormatter]
                                if (f) value = f(value)
                            }
                            group.addCompare(s[1], s[2] as Operator, value)
                        } else if (s[4] !== undefined) group.addGroup(subQuerys[Number(s[4])])
                    }
                }

                newQuery = newQuery.replace(result.value[0], 'sq' + subQuerys.length)
                if (group.parts.length > 0) subQuerys.push(group)
                result = matches.next()
            }
        }

        if (subQuerys.length === 0) return null
        return subQuerys[subQuerys.length - 1]
    }, [query, queryValueFormatter])

    const formatRowFlat = useCallback((row: FlatRowFilter): FlatRowFilter => rowFormatter(row, columnFormatter), [columnFormatter])

    const formattedArray: {flatArray: FlatRowFilter[]; data: T[]} = useMemo(() => {
        const keys = [...Array(data.length).keys()] as number[]
        return {flatArray: keys.map(x => formatRowFlat(flat<T, FlatRowFilter>(data[x])) as FlatRowFilter), data: keys.map(x => data[x])}
    }, [data, formatRowFlat])

    const newData: T[] | undefined = useMemo(() => {
        if (queryFilter === null) return undefined
        return [...Array(formattedArray.flatArray.length).keys()].filter(x => queryFilter.filter(formattedArray.flatArray[x])).map(x => formattedArray.data[x])
    }, [formattedArray, queryFilter])

    return {
        data: newData ?? data,
    }
}
