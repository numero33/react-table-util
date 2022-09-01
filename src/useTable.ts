import {useCallback, useState, useEffect, useRef, useMemo} from 'react'

export interface useTableProps {
    columns: {[columnKey: string]: ColumnProps}
}

interface IColumnSize {
    [column: string]: number
}

type IColumnOrder = string[]

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
    getReorderHandler?: (event: React.MouseEvent | React.TouchEvent) => void
    isResizing: boolean
    isReordering: boolean
}

export interface ColumnResizeProps {
    deltaOffset: number
    column: string
    startOffset: number
    startWidth: number
    type: HandlerType
}

export enum HandlerType {
    Resize = 1,
    Reorder,
}

const isTouchStartEvent = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) => (e as React.TouchEvent).type.startsWith('touch')
const getClientX = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) =>
    isTouchStartEvent(e) ? Math.round((e as React.TouchEvent).touches[0].clientX ?? 0) : (e as React.MouseEvent).clientX

const calculateColumnReorderOffset = (columnOrderRef: IColumnOrder, columnSizeRef: IColumnSize, mutationColumnKey: string | undefined) => {
    if (!mutationColumnKey) return 0
    const currentColumnIndex = columnOrderRef.indexOf(mutationColumnKey)
    return columnOrderRef
        .filter((_, i) => i <= currentColumnIndex)
        .map(c => columnSizeRef[c])
        .reduce((prev, val) => prev + val, 0)
}

const findClosestColumn = (columnOrderRef: IColumnOrder, columnSizeRef: IColumnSize, columnReorderOffset: number, deltaOffset: number) => {
    if (deltaOffset === 0) return {val: 0, position: 0}
    return columnOrderRef
        ?.map(c => columnSizeRef[c])
        ?.reduce((prev, val) => [...prev, (prev?.[prev.length - 1] ?? 0) + val], [] as number[])
        ?.map(x => x - columnReorderOffset)
        ?.reduce((prev, val, index) => (Math.abs(val - deltaOffset) < Math.abs(prev.val - deltaOffset) ? {val, position: index} : prev), {
            val: 0,
            position: 0,
        })
}

export function useTable({columns}: useTableProps): useTableReturn {
    const [deltaOffset, setDeltaOffset] = useState(0)
    const [mutationColumnKey, setMutationColumnKey] = useState<string>()

    const resizeInfo = useRef({} as ColumnResizeProps)
    const columnRef = useRef(new Map<string, HTMLElement>())

    const [columnSizeRef, setColumnSizeRef] = useState<IColumnSize>({})
    const [columnOrderRef, setColumnOrderRef] = useState<IColumnOrder>([])
    const [columnStore, setColumnStore] = useState<ColumnReturn[]>([])

    const columnMoveHandler = useCallback((e: React.MouseEvent | React.TouchEvent, type: HandlerType) => {
        if (isTouchStartEvent(e) && (e as React.TouchEvent).touches && (e as React.TouchEvent).touches.length > 1) return

        const clientX = getClientX(e)
        resizeInfo.current.startOffset = clientX
        resizeInfo.current.type = type

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

                switch (type) {
                    case HandlerType.Resize:
                        setColumnSizeRef(columnSizeRef => {
                            const currentWidth = columnSizeRef[currentColumnKey]
                            if (startWidth !== currentWidth) {
                                const sumSteps = Object.keys(columnSizeRef).reduce((sum, key) => sum + columnSizeRef[key], 0)

                                const fullWidthBefore = (startWidth / currentWidth) * sumSteps

                                const deltaPercentage2 = (1 / fullWidthBefore) * Math.min(startWidth + deltaOffset, fullWidthBefore)
                                if (deltaPercentage2 >= 1) return columnSizeRef
                                return {
                                    ...columnSizeRef,
                                    [currentColumnKey]: Math.round(((sumSteps - currentWidth) / (1 - deltaPercentage2)) * deltaPercentage2),
                                }
                            }
                            return {...columnSizeRef, [currentColumnKey]: startWidth + deltaOffset}
                        })
                        break
                    case HandlerType.Reorder:
                        setColumnSizeRef(columnSizeRef => {
                            setColumnOrderRef(columnOrderRef => {
                                const columnReorderOffset = calculateColumnReorderOffset(columnOrderRef, columnSizeRef, currentColumnKey)

                                const closest = findClosestColumn(columnOrderRef, columnSizeRef, columnReorderOffset, deltaOffset)
                                if (closest.val === 0) return columnOrderRef

                                const to = closest.position
                                const from = columnOrderRef.indexOf(currentColumnKey)
                                const newOrder = [...columnOrderRef]
                                const item = newOrder.splice(from, 1)[0]
                                newOrder.splice(to, 0, item)
                                return newOrder
                            })
                            return columnSizeRef
                        })

                        break
                }
            }

            resizeInfo.current = {} as ColumnResizeProps
            setDeltaOffset(0)
            setMutationColumnKey(undefined)
        }

        document.addEventListener('mouseup', onUp)
        document.addEventListener('mousemove', onMove)
        document.addEventListener('touchend', onUp)
        document.addEventListener('touchmove', onMove)
    }, [])

    useEffect(() => {
        const returnColumns: ColumnReturn[] = []
        const returnColumnSize: {[column: string]: number} = {}
        const returnColumnOrder: string[] = []
        Object.keys(columns).forEach(key => {
            returnColumnSize[key] = columns[key].width ?? 250
            returnColumnOrder.push(key)
            returnColumns.push({
                key,
                accessorKey: columns[key].key ?? key,
                width: 0,
                widthPercent: 0,
                getResizeHandler: (event: React.MouseEvent | React.TouchEvent) => {
                    resizeInfo.current.column = key
                    resizeInfo.current.startWidth = columnRef.current.get(key)?.getBoundingClientRect().width ?? 0
                    columnMoveHandler(event, HandlerType.Resize)
                },
                getReorderHandler: (event: React.MouseEvent | React.TouchEvent) => {
                    resizeInfo.current.column = key
                    setMutationColumnKey(key)
                    columnMoveHandler(event, HandlerType.Reorder)
                },
                setRef: (ref: HTMLElement) => columnRef.current.set(key, ref),
                isResizing: false,
                isReordering: false,
            })
        })
        setColumnStore(returnColumns)
        setColumnSizeRef(returnColumnSize)
        setColumnOrderRef(returnColumnOrder)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnMoveHandler])

    const columnSum = useMemo(() => columnStore.reduce((acc, column) => acc + columnSizeRef[column.key], 0), [columnStore, columnSizeRef])
    const columnReturn = columnStore
        .sort((a, b) => columnOrderRef.indexOf(a.key) - columnOrderRef.indexOf(b.key))
        .map(column => ({
            ...column,
            width: columnSizeRef[column.key],
            widthPercent: (columnSizeRef[column.key] / columnSum) * 100,
            isResizing: resizeInfo.current.column === column.key && resizeInfo.current.type === HandlerType.Resize,
            isReordering: resizeInfo.current.column === column.key && resizeInfo.current.type === HandlerType.Reorder,
        }))

    const columnReorderOffset = useMemo(
        () => calculateColumnReorderOffset(columnOrderRef, columnSizeRef, mutationColumnKey),
        [columnOrderRef, columnSizeRef, mutationColumnKey],
    )

    return {
        columns: columnReturn,
        getColumn: (column: string) => columnReturn.find(i => i.key === column),
        deltaOffset:
            (resizeInfo.current.type ?? HandlerType.Resize) === HandlerType.Resize
                ? deltaOffset
                : findClosestColumn(columnOrderRef, columnSizeRef, columnReorderOffset, deltaOffset).val,
    }
}
