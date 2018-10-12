import { action, decorate, observable } from 'mobx'

export default function MobxActions(actionTypes, middleware) {
    
    const _stores = []
    
    const actions = {}
    
    let dispatchId = 0
    actionTypes.forEach((type) => {
        actions[type] = action((actionArg) => {
            const currentDispatchId = dispatchId
            _stores.forEach(store => {
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
    
    const bindActionsToHandlers = (store) => {
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
        _stores.push(store)
    }
    
    const handler = (StoreClass) => {
        return class extends StoreClass {
            constructor() {
                super()
                const { actionHandlers } = this
                if (!actionHandlers) {
                    return
                }
                Object.entries(actionHandlers).forEach(([actionType, handler]) => {
                    // autobinding
                    actionHandlers[actionType] = handler.bind(this)
                })
                bindActionsToHandlers(this)
            }
        }
    }
    
    const store = (StoreClass) => {
        return class extends handler(StoreClass) {
            constructor() {
                super()
                const observableShape = {} // this does not affect getters and setters
                Object.keys(this).forEach((key) => {
                    observableShape[key] = observable
                })
                decorate(this, observableShape)
            }
        }
    }
    
    return { actions, handler, store }
}
