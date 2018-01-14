# mobx-actions

This package lets you dispatch actions from anywhere, and react to them in your Mobx stores.

To use, pass a list of action names to the library's default export.

```
// actions.js

import MobxActions from 'mobx-actions'

const actionNames = [
    'applicationLoaded',
    'userClickedSignupButton',
    'serverAcknowledgedSignupClick'
]

export const { actions, bindActionsToHandlers } = MobxActions(actionNames)
```

Dispatch actions using the `actions` object.

```
// app.jsx

import { observer } from 'mobx-react'
import store from './store.js' // defined next
import { actions } from './actions.js'

const App = observer(() => {
    const { clickButtonMessage, subtext } = store
    return (
        <div>
            <button type="button" onClick={actions.userClickedSignupButton}>{clickButtonMessage}</button>
            <h6>{subtext}</h6>
        </div>
    )
    
})

ReactDOM.render(<App />, document.getElementById('contrivedExample'), () => {
    actions.applicationLoaded()
})
```

Bind actions to in-store handlers via the `bindActionsToHandlers` function.

```
// store.js

import axios from 'axios'
import { actions, bindActionsToHandlers } from './actions.js'

class Store {
    @observable clickButtonMessage = 'Wait, don't click me yet!'
    @observable subtext = ''
    actionHandlers = {
        applicationLoaded: () => {
            this.clickButtonMessage = 'Click me!'
        },
        userClickedSignupButton: () => {
        
            this.clickButtonMessage = 'You clicked me!'
            
            axios.post('/analytics', { someoneClicked: true })
                .then((response) => {
                    actions.serverAcknowledgedSignupClick(response.totalClicksToday)
                })
                .catch(console.error)
        },
        serverAcknowledgedSignupClick: (totalClicksToday) => {
            this.subtext = `There have been ${totalClicksToday} total clicks today.`
        }
    }
}

const store = new Store()
bindActionsToHandlers(store)
export default store
```

A few other things:

- This works with the `useStrict` Mobx feature
- This supports pre-dispatch and post-dispatch middleware (just read index.js in the repo if you want to use this -- it's short)
- Check out https://github.com/8balloon/boilerplate for another example
