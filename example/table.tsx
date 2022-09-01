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
    const {data: sortedList} = useSort({data: filterdList, columnFormatter})
    const {columns, getColumn, deltaOffset} = useTable({
        columns: {'person.firstName': {key: 'firstName'}, lastNameNewColumn: {}, age: {}, visits: {}, progress: {}, status: {}},
    })

    // console.debug({columns})

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
                            key={c.key}
                            ref={r => r && c.setRef(r)}
                            style={{
                                // flexBasis: `${c.width}rem`,
                                // width: `${c.width}px`,
                                width: `${percentage ? `${c.widthPercent}%` : `${c.width}px`}`,
                            }}
                        >
                            {c.key}
                            <div
                                className={`resizer ${c.isResizing ? 'isResizing' : ''}`}
                                onMouseDown={c?.getResizeHandler}
                                onTouchStart={c?.getResizeHandler}
                                style={{
                                    transform: columnResizeMode === 'onEnd' && c.isResizing ? `translateX(${deltaOffset}px)` : '',
                                }}
                            />
                            <div
                                className={`reorder ${c.isReordering ? 'isReordering' : ''}`}
                                onMouseDown={c?.getReorderHandler}
                                onTouchStart={c?.getReorderHandler}
                                style={{
                                    transform: c.isReordering ? `translateX(${deltaOffset}px)` : '',
                                }}
                            />
                        </div>
                    ))}
                </div>
                {sortedList.map((x, i) => (
                    <div key={i} className="row">
                        {columns.map(c => (
                            <div
                                style={{
                                    width: `${percentage ? `${getColumn(c.key)?.widthPercent}%` : `${getColumn(c.key)?.width}px`}`,
                                    padding: 0,
                                }}
                            >
                                {x?.[c.key] ?? `-`}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
let App = document.getElementById('root')

ReactDOM.render(<Example />, App)
