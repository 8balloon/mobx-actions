import { action, decorate, observable } from 'mobx'

export default function MobxActions(actionTypes, middleware) {

    if (!Array.isArray(actionTypes) || actionTypes.some(actionType => typeof actionType !== 'string')) {
        throw new Error('first argument ("actionTypes") must be an array of strings')
    }
    if (middleware && typeof middleware !== 'function') {
        throw new Error('second optional argument ("middleware") must be a function')
    }

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

    const _makeHander = (instance) => {
        const { actionHandlers } = instance
        if (!actionHandlers) {
            // there's no reason to @handler something if there's no actionHandlers.
            throw new Error('No actionHandlers property detected on store class.')
        }
        Object.entries(actionHandlers).forEach(([actionType, handler]) => {
            // autobinding
            actionHandlers[actionType] = handler.bind(instance)
        })
        bindActionsToHandlers(instance)
    }
    
    /*
    Validation lives here for both handlers and stores,
    since all stores are handlers.
    */
    const handler = (StoreObjectOrClass) => {
        if (
            !StoreObjectOrClass
            || !['object', 'function'].includes(typeof StoreObjectOrClass)
            || Array.isArray(StoreObjectOrClass)
        ) {
            throw new Error('Store base must be object or class.')
        }
        if (typeof StoreObjectOrClass === 'object') {
            _makeHandler(StoreObjectOrClass)
            return StoreObjectOrClass
        }
        return class extends StoreObjectOrClass {
            constructor() {
                super()
                _makeHandler(this)
            }
        }
    }

    const _makeStore = (instance) => {
        const observableShape = {} // this does not affect getters and setters
        Object.keys(instance).forEach((key) => {
            observableShape[key] = observable
        })
        decorate(instance, observableShape)
    }
    
    const store = (StoreObjectOrClass) => {
        // store base validation lives in the `handler` function
        if (typeof StoreObjectOrClass === 'object') {
            _makeHandler(StoreObjectOrClass)
            _makeStore(StoreObjectOrClass)
            return StoreObjectOrClass
        }
        return class extends StoreObjectOrClass {
            constructor() {
                super()
                _makeHander(this)
                _makeStore(this)
            }
        }
    }
    
    return { actions, handler, store }
}
