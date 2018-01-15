# mobx-actions

This package lets you dispatch actions from anywhere, and react to them in your Mobx stores.

To configure, pass a list of action names to the library's default export.

```
// actions.js

import MobxActions from 'mobx-actions'

const actionNames = [
    'applicationLoaded',
    'userClickedSignupButton',
    'serverAcknowledgedSignupClick'
]

export const { actions, subscriber } = MobxActions(actionNames)
```

Dispatch actions using the `actions` object.

```
// app.jsx

import { observer } from 'mobx-react'
import store from './store.js'
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

Listen for actions with the `@subscriber` decorator.

```
// store.js

import axios from 'axios'
import { actions, subscriber } from './actions.js'

@subscriber
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

export default new Store()
```

A few other things:

- This works with the `useStrict` Mobx feature
- This supports pre-dispatch and post-dispatch middleware. (See index.js in the repo if you're curious.)
- Check out https://github.com/8balloon/boilerplate for another example
