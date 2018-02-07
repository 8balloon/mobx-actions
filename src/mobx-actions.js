import { action } from 'mobx'

export default function MobxActions(actionTypes, middleware) {
    
    const actions = {}
    let dispatchId = 0
    actionTypes.forEach((type) => {
        actions[type] = action((actionArg) => {
            const currentDispatchId = dispatchId
            stores.forEach(store => {
                const handler = store.actionHandlers[type]
                if (!handler) {
                    return
                }
                if (!middleware) {
                    handler(actionArg)
                    return
                }
                const next = () => handler(actionArg)
                middleware({
                    dispatchId: currentDispatchId,
                    actionType: type,
                    action: actionArg,
                    store,
                    handler
                }, next)
            })
            dispatchId++
        })
    })
    
    const stores = []
    const bindActionsToHandlers = (store) => {
        if (!store.actionHandlers) {
            console.error({ store })
            throw new Error('Missing actionHandlers store property!!')
        }
        Object.entries(store.actionHandlers).forEach(([actionType, handler]) => {
            if (!actions[actionType]) {
                console.error({ key: actionType, handler, store })
                throw new Error(`actionHandler with key { ${actionType} } does not correspond to an action!!`)
            }
            if (typeof handler !== 'function') {
                console.error({ handler, actionType, store })
                throw new Error('actionHandler must be a function!!')
            }
        })
        stores.push(store)
    }
    
    const subscriber = (StoreClass) => {
        return class extends StoreClass {
            constructor() {
                super()
                bindActionsToHandlers(this)
            }
        }
    }
    
    return { actions, subscriber }
}
