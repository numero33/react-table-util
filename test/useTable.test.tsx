import {renderHook, render, fireEvent, screen} from '@testing-library/react'

import {useTable} from '../src'

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

    const resizeRelative = async (delta: number) => {
        const sizedWidth = 100
        const shownWidth = 50
        const {result} = renderHook(() =>
            useTable({
                columns: {first: {width: sizedWidth}, second: {width: sizedWidth}},
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
        expect(result.current.columns[0].width).toEqual(delta > 0 ? 233 : 43)
    }

    test('resize relative positive', () => resizeRelative(20))
    test('resize relative negative', () => resizeRelative(-20))

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
