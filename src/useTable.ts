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

    getResizeHandler?: (event: Event) => void
    isResizing: boolean
}

interface ColumnResizeProps {
    deltaOffset: number
    column: string
    startOffset: number
    startWidth: number
    needCalc: boolean
}

const isTouchStartEvent = (e: Event) => (e as TouchEvent).type === 'touchstart'

export function useTable({columns}: useTableProps): useTableReturn {
    const [deltaOffset, setDeltaOffset] = useState(0)
    const resizeInfo = useRef({} as ColumnResizeProps)
    const columnRef = useRef(new Map<string, HTMLElement>()).current
    const columnSizeRef = useRef(new Map<string, number>()).current
    const [columnStore, setColumnStore] = useState([] as ColumnReturn[])

    const resizeHandler = useCallback((e: Event) => {
        if (isTouchStartEvent(e) && (e as TouchEvent).touches && (e as TouchEvent).touches.length > 1) return

        const clientX = isTouchStartEvent(e) ? Math.round((e as TouchEvent).touches[0]!.clientX) : (e as MouseEvent).clientX
        resizeInfo.current.startOffset = clientX ?? 0

        const updateOffset = (clientXPos?: number) => {
            if (typeof clientXPos !== 'number') return

            const deltaOffset = clientXPos - resizeInfo.current.startOffset

            setDeltaOffset(deltaOffset)
            resizeInfo.current.deltaOffset = deltaOffset
        }

        const onMove = (e: Event) => updateOffset((e as MouseEvent).clientX)

        const onUp = (_: Event) => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)

            if (resizeInfo.current.needCalc) {
                let sumSteps = 0
                columnSizeRef.forEach(i => (sumSteps += i))

                const fullWidthBefore = (resizeInfo.current.startWidth / (columnSizeRef.get(resizeInfo.current.column) ?? 1)) * sumSteps

                const deltaPercentage2 = (1 / fullWidthBefore) * (resizeInfo.current.startWidth + resizeInfo.current.deltaOffset)
                const newStep = Math.round(((sumSteps - (columnSizeRef.get(resizeInfo.current.column) ?? 1)) / (1 - deltaPercentage2)) * deltaPercentage2)
                columnSizeRef.set(resizeInfo.current.column, newStep)
            } else columnSizeRef.set(resizeInfo.current.column, resizeInfo.current.startWidth + resizeInfo.current.deltaOffset)

            resizeInfo.current = {} as ColumnResizeProps
            setDeltaOffset(0)
        }

        resizeInfo.current.startWidth = columnRef.get(resizeInfo.current.column)?.getBoundingClientRect().width ?? 0
        resizeInfo.current.needCalc = resizeInfo.current.startWidth !== (columnSizeRef.get(resizeInfo.current.column) ?? 0)
        document.addEventListener('mouseup', onUp)
        document.addEventListener('mousemove', onMove)
    }, [])

    useEffect(() => {
        const returnColumns: ColumnReturn[] = []
        Object.keys(columns).forEach(key => {
            columnSizeRef.set(key, columns[key].width ?? 250)
            returnColumns.push({
                key,
                accessorKey: columns[key]?.key ?? key,
                width: 0,
                widthPercent: 0,
                getResizeHandler: (event: Event) => {
                    resizeInfo.current.column = key
                    resizeHandler(event)
                },
                setRef: (ref: HTMLElement) => columnRef.set(key, ref),
                isResizing: false,
            })
        })
        setColumnStore(returnColumns)
    }, [])

    const columnReturn = useMemo(() => {
        const sum = columnStore.reduce((acc, column) => acc + (columnSizeRef.get(column.key) ?? 1), 0)
        return columnStore.map(column => ({...column, width: columnSizeRef.get(column.key) ?? 1, widthPercent: ((columnSizeRef.get(column.key) ?? 1) / sum) * 100, isResizing: resizeInfo.current.column === column.key}))
    }, [columnStore, columnSizeRef, resizeInfo.current.column])

    return {
        columns: columnReturn,
        getColumn: (column: string) => columnReturn.find(i => i.key === column),
        deltaOffset: deltaOffset,
    }
}
