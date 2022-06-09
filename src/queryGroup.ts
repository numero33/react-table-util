import {FlatRowFilter, FlatRowValueFilter} from './columnFormatter'

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

export enum FilterConjunctive {
    And = 'and',
    Or = 'or',
}

export type Comparer =
    | {
          left: string
          operator: Operator.Eq | Operator.NotEq
          right: string | boolean
      }
    | {
          left: string
          operator: Operator.EqReg | Operator.NotEqReg
          right: RegExp
      }
    | {
          left: string
          operator: Operator.Gt | Operator.GtOrEq | Operator.Lt | Operator.LtOrEq
          right: number
      }

export class QueryGroup {
    parts: Array<Comparer | QueryGroup>
    filterConjunctive: FilterConjunctive

    constructor(conjunctive: FilterConjunctive = FilterConjunctive.And) {
        this.parts = []
        this.filterConjunctive = conjunctive
        return this
    }

    filter(row: FlatRowFilter): boolean {
        const cloneParts = [...this.parts]
        while (cloneParts.length > 0) {
            const part = cloneParts.shift()
            if (part !== undefined) {
                let result: boolean

                if (part instanceof QueryGroup) result = part.filter(row)
                else result = this.compare(part, row)

                if (!result && this.filterConjunctive === FilterConjunctive.And) return false
                if (result && this.filterConjunctive === FilterConjunctive.Or) return true
            }
        }
        if (this.filterConjunctive === FilterConjunctive.And) return true
        return false
    }

    compare(c: Comparer, row: FlatRowFilter): boolean {
        switch (c.operator) {
            case Operator.Eq:
                return row[c.left] == c.right
            case Operator.NotEq:
                return row[c.left] != c.right
            case Operator.EqReg:
                return c.right.test(String(row[c.left]))
            case Operator.NotEqReg:
                return !c.right.test(String(row[c.left]))
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

    addCompare(left: string, operator: Operator, right: FlatRowValueFilter): QueryGroup {
        if ([Operator.EqReg, Operator.NotEqReg].includes(operator)) {
            let pattern = String(right)
            let flags = 'i'
            if (String(right)[0] == '/') {
                const i = String(right).lastIndexOf('/')
                if (i > 0) {
                    pattern = String(right).substring(1, i)
                    flags = String(right).substring(i + 1)
                }
            }
            try {
                right = new RegExp(pattern, flags)
            } catch {
                right = new RegExp(escapeStringRegexp(pattern), flags)
            }
            this.parts.push({left, operator: operator as Operator.EqReg | Operator.NotEqReg, right: right as RegExp})
        } else if ([Operator.Gt, Operator.GtOrEq, Operator.Lt, Operator.LtOrEq].includes(operator)) {
            this.parts.push({left, operator: operator as Operator.Gt | Operator.GtOrEq | Operator.Lt | Operator.LtOrEq, right: Number(right)})
        } else {
            // Operator.Eq | Operator.NotEq
            this.parts.push({left, operator: operator as Operator.Eq | Operator.NotEq, right: right as string | boolean})
        }

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
