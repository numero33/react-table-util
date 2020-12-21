export interface Comparer {
    left: any
    operator: string
    right: any
}

export enum filterConjunctive {
    and,
    or,
}

export class QueryGroup {
    parts: Array<Comparer | QueryGroup>
    filterConjunctive: filterConjunctive

    constructor(conjunctive: filterConjunctive = filterConjunctive.and) {
        this.parts = []
        this.filterConjunctive = conjunctive
        return this
    }

    filter(row: any): boolean {
        const cloneParts = [...this.parts]
        while (cloneParts.length > 0) {
            const part = cloneParts.shift()
            if (part !== undefined) {
                let result: boolean

                if (part instanceof QueryGroup) {
                    result = part.filter(row)
                } else {
                    result = this.compare(part, row)
                }

                if (!result && this.filterConjunctive === filterConjunctive.and) return false
                if (result && this.filterConjunctive === filterConjunctive.or) return true
            }
        }
        if (this.filterConjunctive === filterConjunctive.and) return true
        return false
    }

    compare(c: Comparer, row: any): boolean {
        switch (c.operator) {
            case '===':
                return row[c.left] == c.right
            case '!==':
                return row[c.left] != c.right
            case '==':
                return c.right.test(row[c.left])
            case '!=':
                return !c.right.test(row[c.left])
            case '>':
                return row[c.left] > c.right
            case '>=':
                return row[c.left] >= c.right
            case '<':
                return row[c.left] < c.right
            case '<=':
                return row[c.left] <= c.right
        }
        return false
    }

    addCompare(left: string, operator: string, right: any): QueryGroup {
        if ((operator.match(/=/g) || []).length === 2) right = new RegExp('^' + right + '$')
        this.parts.push({left, operator, right})
        return this
    }

    addGroup(group: QueryGroup): QueryGroup {
        this.parts.push(group)
        return this
    }
}
