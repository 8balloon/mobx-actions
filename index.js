import { action, toJS } from 'mobx'

export const loggingMiddlewares = {
    
    preDispatch: (actionName, actionArgument) => {
        console.log(`ACTION { ${actionName} } DISPATCHED`, toJS(actionArgument))
    },
    
    postDispatch: (actionName, actionArgument) => {
        console.log(`action { ${actionName} } completed`)
    }
    
}

export default function MobxActions(actionNames, middlewares) {
    
    if (!middlewares) middlewares = {}
    const { preDispatch, postDispatch } = middlewares
    
    const actions = {}
    actionNames.forEach((name) => {
        actions[name] = action((actionArg) => {
            
            if (preDispatch) {
                preDispatch(name, actionArg)
            }

            stores.forEach(store => {
                const actionHandler = store.actionHandlers[name]
                if (actionHandler) {
                    actionHandler(actionArg)
                }
            })
            
            if (postDispatch) {
                postDispatch(name, actionArg)
            }
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
                throw new Error(`Unregistered action signature detected on store action handler: { ${actionName} }`)
            }
            if (typeof handler !== 'function') {
                console.error({ handler })
                throw new Error('actionHandler must be a function!!')
            }
        })
        stores.push(store)
    }
    
    const assertNoUnusedActionNames = () => {
        actionNames.forEach((actionName) => {
            let isBound = false
            stores.forEach(store => {
                if (store.actionHandlers[actionName]) {
                    isBound = true
                }
            })
            if (!isBound) {
                throw new Error(`Action is not used in any store: { ${actionName} }`)
            }
        })
    }
    
    return { 
        actions, 
        bindActionsToHandlers, 
        assertNoUnusedActionNames 
    }
}
