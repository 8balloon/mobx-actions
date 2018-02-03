# Mobx Actions

> an overly-opinionated reinvisioning of Mobx `@action`s

Dispatch actions from anywhere, and respond to them on your stores with `actionHandlers`.

### Example

```js
import * as React from 'react'
import MobxActions from 'mobx-actions'
import { observable } from 'mobx-react'
import { useStrict, observer } from 'mobx'
import { render } from 'react-dom'

useStrict(true) // or don't. idc.

const actionTypes = [
    'IncrementedCount',
    'DecrementedCount'
]

const { actions, subscriber } = MobxActions(actionTypes)

@subscriber
class CounterStore {
    @observable count = 0
    actionHandlers = {
        IncrementedCount: () => this.count++
        DecrementedCount: () => this.count--
    }
}

const counterStore = new CounterStore()

const Counter = observer(() => {
    const { count } = counterStore
    return <div>
        <button onClick={() => actions.DecrementedCount()}>-</button>
        <span>{counterStore.count}</span>
        <button onClick={() => actions.IncrementedCount()}>+</button>
    </div>
})

render(<Counter />, document.getElementById('root'))
```

### Gotchas and dogmas

##### Mobx Actions will only pass your first argument to action handlers. 

So be sure to stick your data in a single param object, like so:

```js
actions.ClickedLoginButton({ username, email })
```

Other arguments are silently ignored. So just reflect on that.

##### Action handlers go in actionHandlers, and this is a great thing

The `actionHandlers` architecture logically and spatially differentiates your action-handling code from your `@observable` and `@computed` value declarations, making your code infinitely more grokkable.

### Other features

Mobx Actions supports pre- and/or post-dispatch middleware.

```js
...

const preDispatch = (type, arg, dispatchId) => {
    console.log(`Whoa, action '${type}' was just called, and nothing else has happened yet!')
}
const postDispatch = (type, arg, dispatchId) => {
    console.log(`Wow, what a wild ride.')
}

const { actions, subscriber } = MobxActions(actionTypes, { preDispatch, postDispatch })

...
```

You can use this to write your own fancy logger, or to automatically yell at people who write nested action invocations.

### The state of state management

Many React state management frameworks rely on passing state through props. This is a drag because you have to hold the app's store:props mapping in your head as you do stuff, increasing cognitive load and decreasing happiness. 

Other, more classically Flux-like solutions are really clunky, and force you to think about timing.

Mobx is operates differently from other frameworks. Its worst feature is that it comes with completely unnecessary `Provider` and `inject` features. But it's also painful learning to always dereference store values before `Component.render` `return` statements.

### Why this is the best

Mobx avoids the shortcomings of `prop`y and Fluxy frameworks through annotations and low-level magic. It's great.

Mobx Actions augments this innovation by allowing you to dispatch actions throughout your application, and by scolding you for using `Provider` and `inject`.

### Other examples

If you want to see a larger example, check out [my boilerplate](https://github.com/8balloon/frontend-boilerplate).
