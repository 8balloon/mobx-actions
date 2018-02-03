import { action } from 'mobx'

export default function MobxActions(actionTypes, middlewares) {
    
    if (!middlewares) {
        middlewares = {}
    }
    const { preDispatch, postDispatch } = middlewares
    
    const actions = {}
    let dispatchId = 0
    actionTypes.forEach((type) => {
        actions[type] = action((actionArg) => {
            
            const currentDispatchId = dispatchId
            
            if (preDispatch) {
                preDispatch(type, actionArg, currentDispatchId)
            }

            stores.forEach(store => {
                const actionHandler = store.actionHandlers[type]
                if (actionHandler) {
                    actionHandler(actionArg)
                }
            })
            
            if (postDispatch) {
                postDispatch(type, actionArg, currentDispatchId)
            }
            
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
