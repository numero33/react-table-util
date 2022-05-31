import flat from 'flat'
import rowFormatter from '../src/columnFormatter'

const dataList = require('../example/dataList.json')

const swapString = (x: string) => x.split('').reverse().join('')

test('empty columnFormatter', () => {
    const result = rowFormatter(flat(dataList[0]), {})
    expect(result).toEqual(flat(dataList[0]))
})

test('simple existing column', () => {
    const result = rowFormatter(flat(dataList[0]), {
        person: (person: any) => swapString(person.firstName),
        personN: (personN: any) => personN.age * 2,
    })
    expect(result.person).toEqual(swapString(dataList[0].person.firstName))
    expect(result.personN).toEqual(dataList[0].personN.age * 2)
})

test('simple new column', () => {
    const result = rowFormatter(flat(dataList[0]), {
        newPerson: (row: any) => swapString(row.person.firstName),
    })
    expect(result.newPerson).toEqual(swapString(dataList[0].person.firstName))
})

test('same start', () => {
    const result = rowFormatter(flat(dataList[0]), {
        ag: (row: any) => swapString(row.person.firstName),
        age: (age: number) => age * 2,
    })
    expect(result.ag).toEqual(swapString(dataList[0].person.firstName))
    expect(result.age).toEqual(dataList[0].age * 2)
})

test('sub object', () => {
    const result = rowFormatter(flat(dataList[0]), {
        'person.firstName': x => swapString(x),
    })
    expect(result).toEqual(
        flat({
            ...dataList[0],
            person: {
                ...dataList[0].person,
                firstName: swapString(dataList[0].person.firstName),
            },
        }),
    )
})
