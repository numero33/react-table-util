import {useCallback, useMemo} from 'react'
import {QueryGroup} from './queryGroup'
import flat, {unflatten} from 'flat'
import rowFormatter from './columnFormatter'

export enum Operator {
    Eq = '===',
    NotEq = '!==',
    EqReg = '==',
    NotEqReg = '!=',
    Gt = '>',
    GtOrEq = '>=',
    Lt = '<',
    LtOrEq = '<=',
}

export enum FilterConjunctive {
    And = 'and',
    Or = 'or',
}

interface useFilterProps<T> {
    data: Array<T>
    query: string
    columnFormatter?: {[columnName: string]: (value: any) => any}
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

    const formatRowFlat = useCallback((row: any) => rowFormatter(row, columnFormatter), [columnFormatter])

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

                const group = new QueryGroup(m.includes('and') ? FilterConjunctive.And : FilterConjunctive.Or)
                for (const c of m.split(reSplit)) {
                    const s = reCondition.exec(c)
                    if (s !== null) {
                        if (s[1] !== undefined) group.addCompare(s[1], s[2] as Operator, s[3].replace(reReplaceApostrophe, ''))
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
        if (queryFilter !== null) return flatArray.filter(x => queryFilter.filter(formatRowFlat(x))).flatMap(x => unflatten(x))
        return undefined
    }, [flatArray, queryFilter, formatRowFlat])

    return {
        data: newData ?? data,
    }
}
