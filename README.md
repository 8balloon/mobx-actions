# Mobx-Actions

> a reinvisioning of Mobx `@action`s

Dispatch arguments (**actions**) from anywhere, and respond to them on your stores with `actionHandlers`.

### Example

```js
import * as React from 'react'
import MobxActions from 'mobx-actions'
import { useStrict, observable, computed } from 'mobx'
import { observer } from 'mobx-react'
useStrict(true)
import { render } from 'react-dom'

const actionTypes = [
    'IncrementedCount',
    'DecrementedCount'
]

const { actions, subscriber } = MobxActions(actionTypes)

@subscriber
class CounterStore {
    @observable count = 0
    actionHandlers = {
        IncrementedCount: ({ amount }) => {
            this.count += amount
        },
        DecrementedCount: ({ amount }) => {
            this.count -= amount
        }
    }
}
const counterStore = new CounterStore()

@subscriber
class CommentaryStore {
    @observable news = `Nothing's happened yet`
    @computed get analysis() {
        const { count } = counterStore
        const oddOrEven = count % 2 ? 'odd' : 'even'
        return `The current count is ${oddOrEven}.`
    }
    actionHandlers = {
        IncrementedCount: () => {
            this.news = 'The count was incremented.'
        },
        DecrementedCount: () => {
            this.news = 'The count was decremented.'
        }
    }
}
const commentaryStore = new CommentaryStore()

const Counter = observer(() => {
    const { count } = counterStore
    const { news, analysis } = commentaryStore
    
    return <div>
        <div>{news}</div>
        <div>{analysis}</div>
        <button onClick={() => {
            actions.DecrementedCount({ amount: 1 })
        }}>-</button>
        <span>{count}</span>
        <button onClick={() => {
            actions.IncrementedCount({ amount: 1 })
        }}>+</button>
    </div>
})

render(<Counter />, document.getElementById('root'))
```

### Advantages

Mobx-Actions prevents imperative code from touching multiple stores.

Stores update themselves independently in response to events, which cleanly separates concerns.

```js
// instead of this...
<button onClick={e => {
    RegistrationStore.submitRegistration()
    NavigationStore.navigateToRegistrationConfirmation()
}}>
    Register
</button>

//...try this
<button onClick={e => {
    actions.ClickedRegisterButton()
}}>
    Register
</button>
//...and define a `ClickedRegisterButton` handler
// on the two relevant stores
```

### Restrictions

- Actions dispatched must be a single argument. Other arguments will be ignored.
- An action handler must be mapped in a `@subscriber`'s actionHandler property to be invoked.

### Middleware

If you would like to modify the behavior of Mobx-Actions, you can do so thorugh middleware.

```js
const repeatingMiddleware = (ctx, next) => {
    const {
        dispatchId,
        actionType,
        action,
        store,
        handler
    } = ctx
    
    next()
    
    // the equivalent of calling `next()` again
    handler(action)
}

const { actions, subscriber } = 
    MobxActions(actionTypes, repeatingMiddleware)
```

Most users will not require middleware. But if you do, it is extremely flexible.

### Other examples

If you want to see a larger example, check out [this boilerplate](https://github.com/8balloon/frontend-boilerplate).
