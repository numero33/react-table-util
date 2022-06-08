# react-table-util

> React hooks for fast and efficiently sort/filter large lists

[![Coverage Status](https://badgen.net/coveralls/c/github/numero33/react-table-util/master)](https://coveralls.io/github/numero33/react-table-util?branch=master)
[![NPM registry](https://badgen.net/npm/v/react-table-util)](https://npmjs.com/react-table-util)
[![bundlephobia](https://badgen.net/bundlephobia/minzip/react-table-util)](https://bundlephobia.com/package/react-table-util)
[![NPM license](https://badgen.net/npm/license/react-table-util)](LICENSE.md) 

## Install

```bash
# Yarn
yarn add react-table-util

# NPM
npm install --save react-table-util
```

## Usage Filter

```javascript
import {useFilter} from "react-table-util";

const list = [
    {"firstName": "suggestion ftgxk", "lastName": "scarecrow 2as47", "age": 4, "visits": 40, "progress": 7, "status": "relationship"},
    {"firstName": "throat f748b", "lastName": "role dm11c", "age": 16, "visits": 9, "progress": 90, "status": "single"}
]

export default function App() {
    const {data: filterdList} = useFilter({data: list, query: 'visits > 10'})
    return (
        <div className="App">
            {filterdList.map((x, i) => (
                <div key={i}>
                    <div>{x.firstName}</div>
                    <div>{x.lastName}</div>
                    <div>{x.age}</div>
                    <div>{x.visits}</div>
                    <div>{x.progress}</div>
                    <div>{x.status}</div>
                </div>
            ))}
        </div>
    );
}
```

## License

MIT © [n33pm](https://github.com/n33pm)
