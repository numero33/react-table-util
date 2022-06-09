import {useCallback, useState, useEffect, useRef, useMemo} from 'react'

interface useTableProps {
    columns: {[columnKey: string]: ColumnProps}
}

interface ColumnProps {
    key?: string
    width?: number
}

interface useTableReturn {
    columns: ColumnReturn[]
    getColumn: (column: string) => ColumnReturn | undefined
    deltaOffset: number
}

interface ColumnReturn {
    key: string
    accessorKey: string
    width: number
    widthPercent: number
    setRef: (ref: HTMLElement) => void

    getResizeHandler?: (event: React.MouseEvent | React.TouchEvent) => void
    isResizing: boolean
}

interface ColumnResizeProps {
    deltaOffset: number
    column: string
    startOffset: number
    startWidth: number
}

const isTouchStartEvent = (e: React.MouseEvent | React.TouchEvent) => (e as React.TouchEvent).type === 'touchstart'

export function useTable({columns}: useTableProps): useTableReturn {
    const [deltaOffset, setDeltaOffset] = useState(0)
    const resizeInfo = useRef({} as ColumnResizeProps)
    const columnRef = useRef(new Map<string, HTMLElement>()).current
    const [columnSizeRef, setColumnSizeRef] = useState({} as {[column: string]: number})
    const [columnStore, setColumnStore] = useState([] as ColumnReturn[])

    const resizeHandler = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (isTouchStartEvent(e) && (e as React.TouchEvent).touches && (e as React.TouchEvent).touches.length > 1) return

        const clientX = isTouchStartEvent(e) ? Math.round((e as React.TouchEvent).touches[0]?.clientX) : (e as React.MouseEvent).clientX
        resizeInfo.current.startOffset = clientX ?? 0

        const updateOffset = (clientXPos?: number) => {
            if (typeof clientXPos !== 'number') return

            const deltaOffset = clientXPos - resizeInfo.current.startOffset

            setDeltaOffset(deltaOffset)
            resizeInfo.current.deltaOffset = deltaOffset
        }

        const onMove = (e: MouseEvent) => updateOffset(e.clientX)

        const onUp = () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)

            const currentColumnKey = resizeInfo.current.column
            const startWidth = resizeInfo.current.startWidth
            const deltaOffset = resizeInfo.current.deltaOffset

            setColumnSizeRef(columnSizeRef => {
                const currentWidth = columnSizeRef?.[currentColumnKey] ?? 1
                if (startWidth !== currentWidth) {
                    const sumSteps = Object.keys(columnSizeRef).reduce((sum, key) => sum + columnSizeRef[key], 0)

                    const fullWidthBefore = (startWidth / currentWidth) * sumSteps

                    const deltaPercentage2 = (1 / fullWidthBefore) * Math.min(startWidth + deltaOffset, fullWidthBefore)
                    if (deltaPercentage2 >= 1) return columnSizeRef
                    return {...columnSizeRef, [currentColumnKey]: Math.round(((sumSteps - currentWidth) / (1 - deltaPercentage2)) * deltaPercentage2)}
                }
                return {...columnSizeRef, [currentColumnKey]: startWidth + deltaOffset}
            })

            resizeInfo.current = {} as ColumnResizeProps
            setDeltaOffset(0)
        }

        document.addEventListener('mouseup', onUp)
        document.addEventListener('mousemove', onMove)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const returnColumns: ColumnReturn[] = []
        const returnColumnSize: {[column: string]: number} = {}
        Object.keys(columns).forEach(key => {
            returnColumnSize[key] = columns[key].width ?? 250
            returnColumns.push({
                key,
                accessorKey: columns[key]?.key ?? key,
                width: 0,
                widthPercent: 0,
                getResizeHandler: (event: React.MouseEvent | React.TouchEvent) => {
                    resizeInfo.current.column = key
                    resizeInfo.current.startWidth = columnRef.get(key)?.getBoundingClientRect().width ?? 0
                    resizeHandler(event)
                },
                setRef: (ref: HTMLElement) => columnRef.set(key, ref),
                isResizing: false,
            })
        })
        setColumnStore(returnColumns)
        setColumnSizeRef(returnColumnSize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const columnSum = useMemo(() => columnStore.reduce((acc, column) => acc + (columnSizeRef?.[column.key] ?? 1), 0), [columnStore, columnSizeRef])
    const columnReturn = columnStore.map(column => ({...column, width: columnSizeRef?.[column.key] ?? 1, widthPercent: ((columnSizeRef?.[column.key] ?? 1) / columnSum) * 100, isResizing: resizeInfo.current.column === column.key}))

    return {
        columns: columnReturn,
        getColumn: (column: string) => columnReturn.find(i => i.key === column),
        deltaOffset: deltaOffset,
    }
}
