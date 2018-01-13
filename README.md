# mobx-actions

Check out https://github.com/8balloon/boilerplate for an idea of how to use this.

Assumes you use React + Mobx.

The purpose of this package is to support actions that can be dispatched and then listened to by any store.

To do this, pass a list of action names to the default export. 

```
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import MobxActions from 'mobx-actions'
import axios from 'axios'

const actionNames = [
    'applicationLoaded',
    'userClickedSignupButton',
    'serverAcknowledgedSignupClick'
    ...
]

const { actions, bindActionsToHandlers } = MobxActions(actionNames)

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

const View = () => {
    const { clickButtonMessage, subtext } = store
    return (
        <div>
            <button type="button" onClick={actions.userClickedSignupButton}>{clickButtonMessage}</button>
            <h6>{subtext}</h6>
        </div>
    )
}

ReactDOM.render(<View />, document.getElementById('contrivedExample'), () => {
    actions.applicationLoaded()
})

```

A few other things:

- This works with `useStrict` on.
- There's action-logging middleware support if you want it.
- You should probably just read index.js in the github repo if you want to get the whole picture (it's really not long)
- Open an issue here if you have questions. (Chances are not a single person will ever read this lol.)
