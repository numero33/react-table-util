import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'

import {useFilter, useSort, isSortedBy} from '../dist/index.cjs.js'

import list from './dataList.json'

function Example() {
    const [query, setQuery] = useState('')
    const [queryParts, setQueryParts] = useState({})

    console.debug(JSON.stringify(list))

    useEffect(() => {
        setQuery(
            Object.keys(queryParts)
                .filter(k => queryParts[k].length > 0)
                .map(k => k + ' == ' + queryParts[k])
                .join(' and '),
        )
    }, [queryParts])

    const {data: filterdList} = useFilter({data: list, query})
    const {data: sortedList, onSortBy, sortedBy} = useSort({data: filterdList})

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
                    <span onClick={() => onSortBy('firstName')}>firstName {isSortedBy(sortedBy, 'firstName') > 0 ? (isSortedBy(sortedBy, 'firstName') === 1 ? `Up` : `Down`) : `Sort`}</span>
                    <input
                        type="text"
                        style={{width: '100%'}}
                        value={queryParts['firstName']}
                        onChange={e => {
                            const v = e.target.value
                            setQueryParts(x => ({...x, firstName: v}))
                        }}
                    />
                </div>
                <div>
                    <span onClick={() => onSortBy('lastName')}>lastName {isSortedBy(sortedBy, 'lastName') > 0 ? (isSortedBy(sortedBy, 'lastName') === 1 ? `Up` : `Down`) : `Sort`}</span>
                    <input
                        type="text"
                        style={{width: '100%'}}
                        value={queryParts['lastName']}
                        onChange={e => {
                            const v = e.target.value
                            setQueryParts(x => ({...x, lastName: v}))
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
                    <div>{x.firstName}</div>
                    <div>{x.lastName}</div>
                    <div>{x.age}</div>
                    <div>{x.visits}</div>
                    <div>{x.progress}</div>
                    <div>{x.status}</div>
                </div>
            ))}
        </div>
    )
}
let App = document.getElementById('app')

ReactDOM.render(<Example />, App)
