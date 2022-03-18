export interface Comparer {
    left: any
    operator: string
    right: any
}

export enum Operator {
    Eq = '===',
    NotEq = '!==',
    EqReg = '==',
    NotEqReg = '!=',
    Gt = '>',
    GtOrEq = '>=',
    Lt = '<',
    LtOrEq = '<=',
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

                if (part instanceof QueryGroup) result = part.filter(row)
                else result = this.compare(part, row)

                if (!result && this.filterConjunctive === filterConjunctive.and) return false
                if (result && this.filterConjunctive === filterConjunctive.or) return true
            }
        }
        if (this.filterConjunctive === filterConjunctive.and) return true
        return false
    }

    compare(c: Comparer, row: any): boolean {
        switch (c.operator) {
            case Operator.Eq:
                return row[c.left] == c.right
            case Operator.NotEq:
                return row[c.left] != c.right
            case Operator.EqReg:
                return c.right.test(row[c.left])
            case Operator.NotEqReg:
                return !c.right.test(row[c.left])
            case Operator.Gt:
                return row[c.left] > c.right
            case Operator.GtOrEq:
                return row[c.left] >= c.right
            case Operator.Lt:
                return row[c.left] < c.right
            case Operator.LtOrEq:
                return row[c.left] <= c.right
        }
        return false
    }

    addCompare(left: string, operator: Operator, right: any): QueryGroup {
        if ([Operator.EqReg, Operator.NotEqReg].includes(operator)) {
            let pattern = right
            let flags = 'i'
            if (right[0] == '/') {
                const i = right.lastIndexOf('/')
                if (i > 0) {
                    pattern = right.substring(1, i)
                    flags = right.substring(i + 1)
                }
            }
            try {
                right = new RegExp(pattern, flags)
            } catch {
                right = new RegExp(escapeStringRegexp(pattern), flags)
            }
        }
        this.parts.push({left, operator, right})
        return this
    }

    addGroup(group: QueryGroup): QueryGroup {
        this.parts.push(group)
        return this
    }
}

// https://github.com/sindresorhus/escape-string-regexp
export const escapeStringRegexp = (string: string) => {
    // Escape characters with special meaning either inside or outside character sets.
    // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
    return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}
