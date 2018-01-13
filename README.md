# mobx-actions

Assumes you use React + Mobx.

This package lets you dispatch actions and the listen for them on Mobx stores.

To do this, pass a list of action names to the default export. You'll get back an `actions` dispatcher object, and a function you can use on stores to make them listen for actions.

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

const View = observer(() => {
    const { clickButtonMessage, subtext } = store
    return (
        <div>
            <button type="button" onClick={actions.userClickedSignupButton}>{clickButtonMessage}</button>
            <h6>{subtext}</h6>
        </div>
    )
})

ReactDOM.render(<View />, document.getElementById('contrivedExample'), () => {
    actions.applicationLoaded()
})

```

A few other things:

- This works with `useStrict` on.
- This supports pre-dispatch and post-dispatch middleware, if you're into that
- You should probably just read index.js in the github repo if you want to get the whole picture (it's really not long)
- Open an issue here if you have questions. (Chances are not a single person will ever read this lol.)
- Check out https://github.com/8balloon/boilerplate for another example
