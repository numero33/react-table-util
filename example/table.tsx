import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {useFilter, useSort, isSortedBy, useTable} from '../.'

import list from './dataList.json'

function Example(): JSX.Element {
    const [percentage, setPercentage] = React.useState(false)
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
        'person.firstName': x => String(x).split('').reverse().join(''),
        lastNameNewColumn: row => row.person.lastName,
    }

    const {data: filterdList} = useFilter({data: list, query, columnFormatter})
    const {data: sortedList, onSortBy, sortedBy} = useSort({data: filterdList, columnFormatter})
    const {columns, getColumn, deltaOffset} = useTable({columns: {'person.firstName': {key: 'firstName'}, lastNameNewColumn: {}, age: {}, visits: {}, progress: {}, status: {}}})

    const columnResizeMode = 'onEnd' ?? 'onChange'

    return (
        <div>
            <button onClick={() => setPercentage(p => !p)}>{percentage ? 'Show' : 'Hide'} %</button>
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
            <div className="table" style={{width: !percentage ? columns.reduce((sum, val) => (val?.width ?? 0) + sum, 0) : `auto`}}>
                <div className="row header">
                    {columns.map(c => (
                        <div
                            ref={r => r && c.setRef(r)}
                            style={{
                                // flexBasis: `${c.width}rem`,
                                // width: `${c.width}px`,
                                width: `${percentage ? `${c.widthPercent}%` : `${c.width}px`}`,
                            }}
                        >
                            {c.width}
                            <div
                                className={`resizer ${c.isResizing ? 'isResizing' : ''}`}
                                onMouseDown={c?.getResizeHandler}
                                onTouchStart={c?.getResizeHandler}
                                style={{
                                    transform: columnResizeMode === 'onEnd' && c.isResizing ? `translateX(${deltaOffset}px)` : '',
                                }}
                            />
                        </div>
                    ))}
                </div>
                {sortedList.map((x, i) => (
                    <div key={i} className="row">
                        <div
                            style={{
                                width: `${percentage ? `${getColumn('person.firstName')?.widthPercent}%` : `${getColumn('person.firstName')?.width}px`}`,
                                padding: 0,
                            }}
                        >
                            {x.person.firstName}
                        </div>
                        <div
                            style={{
                                width: `${percentage ? `${getColumn('lastNameNewColumn')?.widthPercent}%` : `${getColumn('lastNameNewColumn')?.width}px`}`,
                                padding: 0,
                            }}
                        >
                            {x.person.lastName}
                        </div>
                        <div
                            style={{
                                width: `${percentage ? `${getColumn('age')?.widthPercent}%` : `${getColumn('age')?.width}px`}`,
                                padding: 0,
                            }}
                        >
                            {x.age}
                        </div>
                        <div
                            style={{
                                width: `${percentage ? `${getColumn('visits')?.widthPercent}%` : `${getColumn('visits')?.width}px`}`,
                                padding: 0,
                            }}
                        >
                            {x.visits}
                        </div>
                        <div
                            style={{
                                width: `${percentage ? `${getColumn('progress')?.widthPercent}%` : `${getColumn('progress')?.width}px`}`,
                                padding: 0,
                            }}
                        >
                            {x.progress}
                        </div>
                        <div
                            style={{
                                width: `${percentage ? `${getColumn('status')?.widthPercent}%` : `${getColumn('status')?.width}px`}`,
                                padding: 0,
                            }}
                        >
                            {x.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
let App = document.getElementById('root')

ReactDOM.render(<Example />, App)
