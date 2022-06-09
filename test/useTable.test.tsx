import {renderHook, render, fireEvent, screen} from '@testing-library/react'

import {ColumnProps, useTable} from '../src'

describe('init', () => {
    test('render without error', () => {
        renderHook(() => useTable({columns: {}}))
    })

    test('default column width', () => {
        const {result} = renderHook(() =>
            useTable({
                columns: {first: {}},
            }),
        )
        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(250)
        expect(result.current.columns[0].key).toEqual('first')
        expect(result.current.columns[0].accessorKey).toEqual('first')
    })

    test('init column', () => {
        const {result} = renderHook(() =>
            useTable({
                columns: {first: {key: 'one', width: 100}},
            }),
        )
        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(100)
        expect(result.current.columns[0].key).toEqual('first')
        expect(result.current.columns[0].accessorKey).toEqual('one')
    })
})

describe('column', () => {
    const resizeAbsolute = async (delta: number) => {
        const {result} = renderHook(() =>
            useTable({
                columns: {first: {width: 100}},
            }),
        )

        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(100)

        const mockGetBoundingClientRect = jest.fn(
            () =>
                ({
                    height: 0,
                    width: result.current.columns[0].width,
                    x: 0,
                    y: 0,
                } as DOMRect),
        )

        render(
            <div
                onMouseDown={result.current.columns[0].getResizeHandler}
                onTouchStart={result.current.columns[0].getResizeHandler}
                data-testid="resize"
                ref={r => {
                    if (!r) return
                    r.getBoundingClientRect = mockGetBoundingClientRect
                    result.current.columns[0].setRef(r)
                }}
            />,
        )

        const resizeContainer = screen.getByTestId('resize')

        await fireEvent.mouseDown(resizeContainer)
        await fireEvent.mouseMove(resizeContainer, {clientX: delta})
        expect(result.current.deltaOffset).toEqual(delta)
        await fireEvent.mouseUp(resizeContainer)

        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(100 + delta)
    }

    test('resize absolute positive', () => resizeAbsolute(50))

    test('resize absolute negative', () => resizeAbsolute(-50))

    const resizeRelative = async (delta: number, columns: {[columnKey: string]: ColumnProps}) => {
        const shownWidth = 50
        const {result} = renderHook(() =>
            useTable({
                columns,
            }),
        )

        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(100)

        const mockGetBoundingClientRect = jest.fn(
            () =>
                ({
                    height: 0,
                    width: shownWidth,
                    x: 0,
                    y: 0,
                } as DOMRect),
        )

        render(
            <div
                onMouseDown={result.current.columns[0].getResizeHandler}
                data-testid="resize"
                ref={r => {
                    if (!r) return
                    r.getBoundingClientRect = mockGetBoundingClientRect
                    result.current.columns[0].setRef(r)
                }}
            />,
        )

        const resizeContainer = screen.getByTestId('resize')

        await fireEvent.mouseDown(resizeContainer)
        await fireEvent.mouseMove(resizeContainer, {clientX: delta})
        expect(result.current.deltaOffset).toEqual(delta)
        await fireEvent.mouseUp(resizeContainer)

        expect(result.current.columns).not.toBeUndefined()
        if (Object.keys(columns).length === 1) expect(result.current.columns[0].width).toEqual(100)
        else expect(result.current.columns[0].width).toEqual(delta > 0 ? 233 : 43)
    }

    test('resize relative one columne', () => resizeRelative(20, {first: {width: 100}}))
    test('resize relative positive', () => resizeRelative(20, {first: {width: 100}, second: {width: 100}}))
    test('resize relative negative', () => resizeRelative(-20, {first: {width: 100}, second: {width: 100}}))

    test('resize double touch', async () => {
        const {result} = renderHook(() =>
            useTable({
                columns: {first: {width: 100}},
            }),
        )

        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(100)

        render(<div onTouchStart={result.current.columns[0].getResizeHandler} data-testid="resize" />)

        const resizeContainer = screen.getByTestId('resize')

        await fireEvent.touchStart(resizeContainer, {
            touches: [{clientX: 50}, {clientX: 100}],
        })
        await fireEvent.touchMove(resizeContainer, {clientX: 50})
        await fireEvent.touchEnd(resizeContainer)

        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(100)
    })

    test('resize touch', async () => {
        const {result} = renderHook(() =>
            useTable({
                columns: {first: {width: 100}},
            }),
        )

        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(100)

        const mockGetBoundingClientRect = jest.fn(
            () =>
                ({
                    height: 0,
                    width: 100,
                    x: 0,
                    y: 0,
                } as DOMRect),
        )

        render(
            <div
                onTouchStart={result.current.columns[0].getResizeHandler}
                data-testid="resize"
                ref={r => {
                    if (!r) return
                    r.getBoundingClientRect = mockGetBoundingClientRect
                    result.current.columns[0].setRef(r)
                }}
            />,
        )

        const resizeContainer = screen.getByTestId('resize')

        await fireEvent.touchStart(resizeContainer, {
            touches: [{clientX: 0}],
        })
        await fireEvent.touchMove(resizeContainer, {
            touches: [{clientX: 50}],
        })
        expect(result.current.deltaOffset).toEqual(50)
        await fireEvent.touchEnd(resizeContainer)

        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(150)
    })

    test('resize clientX undefined', async () => {
        const {result} = renderHook(() =>
            useTable({
                columns: {first: {width: 100}},
            }),
        )

        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(100)

        render(<div onTouchStart={result.current.columns[0].getResizeHandler} data-testid="resize" />)

        const resizeContainer = screen.getByTestId('resize')

        await fireEvent.touchStart(resizeContainer, {
            touches: [{clientX: 0}],
        })
        await fireEvent.touchMove(resizeContainer, {
            touches: [{clientX: 'asdf'}],
        })

        await fireEvent.touchEnd(resizeContainer)

        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.columns[0].width).toEqual(100)
    })

    test('getColumn', () => {
        const {result} = renderHook(() =>
            useTable({
                columns: {first: {width: 100}, second: {width: 200}},
            }),
        )

        expect(result.current.columns).not.toBeUndefined()
        expect(result.current.getColumn).not.toBeUndefined()
        const firstColumn = result.current.getColumn('first')
        expect(firstColumn).not.toBeUndefined()
        expect(firstColumn?.key).toEqual('first')
    })
})
