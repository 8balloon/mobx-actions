# Mobx-Actions

> a reinvisioning of Mobx `@action`s

Dispatch arguments (**actions**) from anywhere, and respond to them on your stores with `actionHandlers`.

### Example

```js
import * as React from 'react'
import MobxActions from 'mobx-actions'
import { observable } from 'mobx-react'
import { useStrict, observer } from 'mobx'
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
        IncrementedCount: ({ amount }) => this.count += amount
        DecrementedCount: ({ amount }) => this.count -= amount
    }
}

const counterStore = new CounterStore()

const Counter = observer(() => {
    const { count } = counterStore
    return <div>
        <button onClick={() => {
            // dispatch action { amount: 1 } of type 'DecrementedCount'
            actions.DecrementedCount({ amount: 1 })
        }}>-</button>
        <span>{counterStore.count}</span>
        <button onClick={() => {
            // dispatch action { amount: 1 } of type 'IncrementedCount'
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
//...and define a `ClickedRegisterButton` handler on each relevant store.
```

### Restrictions

- Actions dispatched must be a single argument. Other arguments will be ignored.
- An action handler must be mapped in a `@subscriber`'s actionHandler property to be invoked.

### Middleware

If you would like to modify the behavior of Mobx-Actions, you can do so thorugh middleware.

```js
const middleware = (ctx, next) => {
    const { dispatchId, actionType, action, store, handler } = ctx
    // next()
    handler(action) // replicating the behavior of `next` ourselves.
}

const { actions, subscriber } = MobxActions(actionTypes, middleware)
```

Most users will not require middleware. But if you do, it is extremely flexible.

### Other examples

If you want to see a larger example, check out [this boilerplate](https://github.com/8balloon/frontend-boilerplate).
