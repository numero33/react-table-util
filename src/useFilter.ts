import {useMemo} from 'react'
import {QueryGroup, filterConjunctive} from './queryGroup'
import flat, {unflatten} from 'flat'

interface useFilterProps {
    data: Array<unknown>
    query: string
}

interface useFilterReturn {
    data: Array<unknown>
}

const reBrace = /\(((?!(\(|\))).)*\)/gim
const reCondition = /\s*(\S+)\s+(\S+)\s+(\S+)\s*|\s*sq(\d+)\s*/
const reReplaceBrace = /^\s*\(+\s*|\s*\)+\s*$/g
const reSplit = /(and|or)/gim

export function useFilter(props: useFilterProps): useFilterReturn {
    const {data, query} = props

    const queryFilter: QueryGroup | null = useMemo(() => {
        if (query.length === 0) return null

        const subQuerys: Array<QueryGroup> = []
        let newQuery: string = '(' + query + ')'
        while (newQuery.includes('(')) {
            const matches = newQuery.matchAll(reBrace)
            for (const match of matches) {
                const m = match[0].replace(reReplaceBrace, '')

                // if (m.includes('and') && m.includes('or')) return {data: [], error: Error('mixed and/or')}
                if (m.includes('and') && m.includes('or')) return null

                const group = new QueryGroup(m.includes('and') ? filterConjunctive.and : filterConjunctive.or)
                for (const c of m.split(reSplit)) {
                    const s = reCondition.exec(c)
                    if (s !== null) {
                        if (s[1] !== undefined) group.addCompare(s[1], s[2], s[3])
                        else if (s[4] !== undefined) group.addGroup(subQuerys[Number(s[4])])
                    }
                }

                newQuery = newQuery.replace(match[0], 'sq' + subQuerys.length)
                subQuerys.push(group)
            }
        }
        if (subQuerys.length === 0) return null
        return subQuerys[subQuerys.length - 1]
    }, [query])

    const flatArray: Array<unknown> = useMemo(() => data.flatMap(x => flat(x)), [data])

    const newData: Array<unknown> | undefined = useMemo(() => {
        if (queryFilter !== null) return (flatArray || []).filter(x => queryFilter.filter(x)).flatMap(x => unflatten(x))
        return undefined
    }, [flatArray, queryFilter])

    return {
        data: newData || data,
    }
}
