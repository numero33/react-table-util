import {unflatten} from 'flat'

export type FlatRowValue = string | number
export type FlatRowValueFilter = FlatRowValue | boolean | RegExp

export type filterColumnFormatters<CN extends string = string> = {[key in CN]?: (value: any) => FlatRowValueFilter}
export type sortingColumnFormatters<CN extends string = string> = {[key in CN]?: (value: any) => FlatRowValue}
export type columnFormatters<CN extends string = string> = filterColumnFormatters<CN> & sortingColumnFormatters<CN>

export interface FlatRow {
    [key: string]: FlatRowValue
}
export interface FlatRowFilter {
    [key: string]: FlatRowValueFilter
}

const rowFormatter = <CN extends string>(row: FlatRowFilter, formatter?: filterColumnFormatters<CN>): FlatRowFilter => {
    if (formatter === undefined) return row
    const keys = Object.keys(formatter) as CN[]
    if (keys.length === 0) return row
    const tmp = {...row}
    for (const c of keys) {
        // exact column name
        if (c in tmp) {
            const f = formatter[c]
            if (f) tmp[c] = f(row[c])
        } else {
            const reg = new RegExp('^' + c + '($|\\.)')
            const objectKeys = Object.keys(tmp).filter(x => reg.test(x))
            if (objectKeys.length > 0) {
                // child object
                let tmpFlatObj = {}
                for (const objectKey of objectKeys) tmpFlatObj = {...tmpFlatObj, [objectKey.replace(c + '.', '')]: tmp[objectKey]}
                const f = formatter[c]
                if (f) tmp[c] = f(unflatten(tmpFlatObj))
            }
            // new column
            else {
                const f = formatter[c]
                if (f) tmp[c] = f(unflatten(row))
            }
        }
    }
    return tmp
}

export default rowFormatter
