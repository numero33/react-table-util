import {useCallback, useState, useEffect, useRef, useMemo} from 'react'

export interface useTableProps {
    columns: {[columnKey: string]: ColumnProps}
}

export interface ColumnProps {
    key?: string
    width?: number
}

export interface useTableReturn {
    columns: ColumnReturn[]
    getColumn: (column: string) => ColumnReturn | undefined
    deltaOffset: number
}

export interface ColumnReturn {
    key: string
    accessorKey: string
    width: number
    widthPercent: number
    setRef: (ref: HTMLElement) => void

    getResizeHandler?: (event: React.MouseEvent | React.TouchEvent) => void
    isResizing: boolean
}

export interface ColumnResizeProps {
    deltaOffset: number
    column: string
    startOffset: number
    startWidth: number
}

const isTouchStartEvent = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) => (e as React.TouchEvent).type.startsWith('touch')
const getClientX = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) =>
    isTouchStartEvent(e) ? Math.round((e as React.TouchEvent).touches[0].clientX ?? 0) : (e as React.MouseEvent).clientX

export function useTable({columns}: useTableProps): useTableReturn {
    const [deltaOffset, setDeltaOffset] = useState(0)
    const resizeInfo = useRef({} as ColumnResizeProps)
    const columnRef = useRef(new Map<string, HTMLElement>()).current
    const [columnSizeRef, setColumnSizeRef] = useState({} as {[column: string]: number})
    const [columnStore, setColumnStore] = useState([] as ColumnReturn[])

    const resizeHandler = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (isTouchStartEvent(e) && (e as React.TouchEvent).touches && (e as React.TouchEvent).touches.length > 1) return

        const clientX = getClientX(e)
        resizeInfo.current.startOffset = clientX

        const updateOffset = (clientXPos?: number) => {
            if (typeof clientXPos !== 'number' || isNaN(clientXPos)) return

            const deltaOffset = clientXPos - resizeInfo.current.startOffset

            setDeltaOffset(deltaOffset)
            resizeInfo.current.deltaOffset = deltaOffset
        }

        const onMove = (e: MouseEvent | TouchEvent) => updateOffset(getClientX(e))

        const onUp = () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
            document.removeEventListener('touchmove', onMove)
            document.removeEventListener('touchend', onUp)

            const deltaOffset = resizeInfo.current.deltaOffset ?? 0
            if (deltaOffset !== 0) {
                const currentColumnKey = resizeInfo.current.column
                const startWidth = resizeInfo.current.startWidth

                setColumnSizeRef(columnSizeRef => {
                    const currentWidth = columnSizeRef[currentColumnKey]
                    if (startWidth !== currentWidth) {
                        const sumSteps = Object.keys(columnSizeRef).reduce((sum, key) => sum + columnSizeRef[key], 0)

                        const fullWidthBefore = (startWidth / currentWidth) * sumSteps

                        const deltaPercentage2 = (1 / fullWidthBefore) * Math.min(startWidth + deltaOffset, fullWidthBefore)
                        if (deltaPercentage2 >= 1) return columnSizeRef
                        return {...columnSizeRef, [currentColumnKey]: Math.round(((sumSteps - currentWidth) / (1 - deltaPercentage2)) * deltaPercentage2)}
                    }
                    return {...columnSizeRef, [currentColumnKey]: startWidth + deltaOffset}
                })
            }

            resizeInfo.current = {} as ColumnResizeProps
            setDeltaOffset(0)
        }

        document.addEventListener('mouseup', onUp)
        document.addEventListener('mousemove', onMove)
        document.addEventListener('touchend', onUp)
        document.addEventListener('touchmove', onMove)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const returnColumns: ColumnReturn[] = []
        const returnColumnSize: {[column: string]: number} = {}
        Object.keys(columns).forEach(key => {
            returnColumnSize[key] = columns[key].width ?? 250
            returnColumns.push({
                key,
                accessorKey: columns[key].key ?? key,
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

    const columnSum = useMemo(() => columnStore.reduce((acc, column) => acc + columnSizeRef[column.key], 0), [columnStore, columnSizeRef])
    const columnReturn = columnStore.map(column => ({
        ...column,
        width: columnSizeRef[column.key],
        widthPercent: (columnSizeRef[column.key] / columnSum) * 100,
        isResizing: resizeInfo.current.column === column.key,
    }))

    return {
        columns: columnReturn,
        getColumn: (column: string) => columnReturn.find(i => i.key === column),
        deltaOffset: deltaOffset,
    }
}
