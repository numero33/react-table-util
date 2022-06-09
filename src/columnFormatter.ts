import {unflatten} from 'flat'

export type FlatRowValue = string | number
export type FlatRowValueFilter = FlatRowValue | boolean | RegExp

export type filterColumnFormatters = {[columnName: string]: (value: any) => FlatRowValueFilter}
export type sortingColumnFormatters = {[columnName: string]: (value: any) => FlatRowValue}

export interface FlatRow {
    [key: string]: FlatRowValue
}
export interface FlatRowFilter {
    [key: string]: FlatRowValueFilter
}

const rowFormatter = (row: FlatRowFilter, formatter?: filterColumnFormatters): FlatRowFilter => {
    if (formatter === undefined) return row
    const keys = Object.keys(formatter)
    if (keys.length === 0) return row
    const tmp = {...row}
    for (const c of keys) {
        // exact column name
        if (c in tmp) tmp[c] = formatter[c](row[c])
        else {
            const reg = new RegExp('^' + c + '($|\\.)')
            const objectKeys = Object.keys(tmp).filter(x => reg.test(x))
            if (objectKeys.length > 0) {
                // child object
                let tmpFlatObj = {}
                for (const objectKey of objectKeys) tmpFlatObj = {...tmpFlatObj, [objectKey.replace(c + '.', '')]: tmp[objectKey]}
                tmp[c] = formatter[c](unflatten(tmpFlatObj))
            }
            // new column
            else tmp[c] = formatter[c](unflatten(row))
        }
    }
    return tmp
}

export default rowFormatter
