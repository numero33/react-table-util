import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {useFilter, useSort, isSortedBy} from '../.'

const list = require('./dataList.json')

function Example(): JSX.Element {
    const [query, setQuery] = React.useState('')
    const [queryParts, setQueryParts] = React.useState({})

    React.useEffect(() => {
        setQuery(
            Object.keys(queryParts)
                .filter(k => queryParts[k].length > 0)
                .map(k => k + ' == ' + queryParts[k])
                .join(' and '),
        )
    }, [queryParts])

    const columnFormatter = {
        'person.firstName': x =>
            String(x)
                .split('')
                .reverse()
                .join(''),
        lastNameNewColumn: row => row.person.lastName,
    }

    const {data: filterdList} = useFilter({data: list, query, columnFormatter})
    const {data: sortedList, onSortBy, sortedBy} = useSort({data: filterdList, columnFormatter})

    return (
        <div>
            query:
            <input
                type="text"
                style={{width: '100%'}}
                value={query}
                onChange={e => {
                    const v = e.target.value
                    setQuery(v)
                }}
            />
            {sortedList.length}
            <div className="row header">
                <div>
                    <span onClick={() => onSortBy('person.firstName')}>firstName {isSortedBy(sortedBy, 'person.firstName') > 0 ? (isSortedBy(sortedBy, 'person.firstName') === 1 ? `Up` : `Down`) : `Sort`}</span>
                    <input
                        type="text"
                        style={{width: '100%'}}
                        value={queryParts['person.firstName']}
                        onChange={e => {
                            const v = e.target.value
                            setQueryParts(x => ({...x, 'person.firstName': v}))
                        }}
                    />
                </div>
                <div>
                    <span onClick={() => onSortBy('lastNameNewColumn')}>lastName {isSortedBy(sortedBy, 'lastNameNewColumn') > 0 ? (isSortedBy(sortedBy, 'lastNameNewColumn') === 1 ? `Up` : `Down`) : `Sort`}</span>
                    <input
                        type="text"
                        style={{width: '100%'}}
                        value={queryParts['lastNameNewColumn']}
                        onChange={e => {
                            const v = e.target.value
                            setQueryParts(x => ({...x, lastNameNewColumn: v}))
                        }}
                    />
                </div>
                <div>
                    <span onClick={() => onSortBy('age')}>age {isSortedBy(sortedBy, 'age') > 0 ? (isSortedBy(sortedBy, 'age') === 1 ? `Up` : `Down`) : `Sort`}</span>
                    <input
                        type="text"
                        style={{width: '100%'}}
                        value={queryParts['age']}
                        onChange={e => {
                            const v = e.target.value
                            setQueryParts(x => ({...x, age: v}))
                        }}
                    />
                </div>
                <div>
                    <span onClick={() => onSortBy('visits')}>visits {isSortedBy(sortedBy, 'visits') > 0 ? (isSortedBy(sortedBy, 'visits') === 1 ? `Up` : `Down`) : `Sort`}</span>
                    <input
                        type="text"
                        style={{width: '100%'}}
                        value={queryParts['visits']}
                        onChange={e => {
                            const v = e.target.value
                            setQueryParts(x => ({...x, visits: v}))
                        }}
                    />
                </div>
                <div>
                    <span onClick={() => onSortBy('progress')}>progress {isSortedBy(sortedBy, 'progress') > 0 ? (isSortedBy(sortedBy, 'progress') === 1 ? `Up` : `Down`) : `Sort`}</span>
                    <input
                        type="text"
                        style={{width: '100%'}}
                        value={queryParts['progress']}
                        onChange={e => {
                            const v = e.target.value
                            setQueryParts(x => ({...x, progress: v}))
                        }}
                    />
                </div>
                <div>
                    <span onClick={() => onSortBy('status')}>status {isSortedBy(sortedBy, 'status') > 0 ? (isSortedBy(sortedBy, 'status') === 1 ? `Up` : `Down`) : `Sort`}</span>
                    <input
                        type="text"
                        style={{width: '100%'}}
                        value={queryParts['status']}
                        onChange={e => {
                            const v = e.target.value
                            setQueryParts(x => ({...x, status: v}))
                        }}
                    />
                </div>
            </div>
            {sortedList.map((x, i) => (
                <div key={i} className="row">
                    <div>{x.person.firstName}</div>
                    <div>{x.person.lastName}</div>
                    <div>{x.age}</div>
                    <div>{x.visits}</div>
                    <div>{x.progress}</div>
                    <div>{x.status}</div>
                </div>
            ))}
        </div>
    )
}
let App = document.getElementById('root')

ReactDOM.render(<Example />, App)
