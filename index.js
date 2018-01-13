import { action } from 'mobx'

export default function MobxActions(actionNames, middlewares) {
    
    if (!middlewares) {
        middlewares = {}
    }
    const { preDispatch, postDispatch } = middlewares
    
    const actions = {}
    let dispatchId = 0
    actionNames.forEach((name) => {
        actions[name] = action((actionArg) => {
            
            const currentDispatchId = dispatchId
            
            if (preDispatch) {
                preDispatch(name, actionArg, currentDispatchId)
            }

            stores.forEach(store => {
                const actionHandler = store.actionHandlers[name]
                if (actionHandler) {
                    actionHandler(actionArg)
                }
            })
            
            if (postDispatch) {
                postDispatch(name, actionArg, currentDispatchId)
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
        Object.entries(store.actionHandlers).forEach(([actionName, handler]) => {
            if (!actions[actionName]) {
                console.error({ key: actionName, handler, store })
                throw new Error(`actionHandler with key { ${actionName} } does not correspond to an action!!`)
            }
            if (typeof handler !== 'function') {
                console.error({ handler, actionName, store })
                throw new Error('actionHandler must be a function!!')
            }
        })
        stores.push(store)
    }
    
    return { actions, bindActionsToHandlers }
}
