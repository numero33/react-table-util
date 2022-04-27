import {unflatten} from 'flat'

const rowFormatter = (row: any, formatter?: {[columnName: string]: (value: any) => any}) => {
    if (formatter === undefined) return row
    const keys = Object.keys(formatter)
    if (keys.length === 0) return row
    const tmp = {...row}
    for (const c of keys) {
        // exact column name
        if (c in tmp) tmp[c] = formatter[c](row[c])
        else {
            const reg = new RegExp('^' + c + '($|\\..*)')
            const objectKeys = Object.keys(tmp).filter(x => reg.test(x))
            console.debug(reg, objectKeys)
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
