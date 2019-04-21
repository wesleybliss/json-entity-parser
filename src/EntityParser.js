
export default class EntityParser {
    
    static defaultOpts = {
        logging: false,
        idKey: '_id'
    }
    
    constructor(opts = {}) {
        
        this.firstRun = true
        this.entities = {}
        
        this.opts = {
            ...EntityParser.defaultOpts,
            ...opts
        }
        
    }
    
    titleCase(s) {
        return s.substring(0, 1).toUpperCase() + s.substring(1)
    }
    
    pluralize(s) {
        return s.toLowerCase().endsWith('s') ? s : `${s}s`
    }
    
    singularize(s) {
        if (s.endsWith('ies'))
            return s.substring(0, s.length - 'ies'.length) + 'y'
        else if (s.endsWith('s'))
            return s.substring(0, s.length - 1)
        return s
    }
    
    getEntityId(o) {
        try {
            if (!o
                || !o.hasOwnProperty(this.opts.idKey)
                || !o[this.opts.idKey])
                return this.getContrivedEntityId()
            else
                return o[this.opts.idKey]
        }
        catch (e) {
            return this.getContrivedEntityId()
        }
    }
    
    getContrivedEntityId() {
        const rn = Math.floor(Math.random() * 10000)
        return `#FAKE_ID#${Date.now()}-${rn}`
    }
    
    formatEntityName(name) {
        if (name.includes('_'))
            name = name
                .split('_')
                .map(this.titleCase.bind(this))
                .join('')
        return this.titleCase(this.pluralize(name))
    }
    
    createEntity(name) {
        this.entities[name] = this.entities[name] || {}
    }
    
    requireValidObject(o) {
        if (typeof o !== 'object')
            throw new Error('Value must be an object')
    }
    
    createEntityMap(o) {
        
        if (!o) return this.entities
        this.requireValidObject(o)
        
        const keys = Object.keys(o)
        
        for (let key of keys) {
            
            let name = this.formatEntityName(key)
            let value = o[key]
            
            if (Array.isArray(value)) {
                this.createEntity(name)
                // Even if costly, iterating every item is more accurate
                // else we might be missing some keys that only some items have
                value.forEach(it => this.createEntityMap(it))
            }
            else if (typeof value === 'object') {
                this.createEntity(name)
                this.createEntityMap(value)
            }
            
        }
        
        return this.entities
        
    }
    
    canCreateBackRef(parentEntity, parentId) {
        
        return parentEntity
            && parentId
            && Boolean(this.entities[parentEntity][parentId])
        
    }
    
    canCreateForwardRef(pk, name) {
        
        let canCreateForwardRef = false
        
        try {
            if (pk && name)
                canCreateForwardRef = true
        } catch (e) {}
        
        return canCreateForwardRef
        
    }
    
    createRef(parentEntity, parentId, name, id, isBackRef = false) {
        
        // Not exactly sure why this is needed, but I think
        // it's on first-run, there's no parent yet
        if (!parentEntity) return
        
        if (this.opts.logging)
            console.info(`+ REF ${parentEntity} / ${parentId} / #REF#${name}:${id}`)
        
        // Parent key we want to add the ref to
        const pk = this.entities[parentEntity][parentId]
        const refCode = `${name}:${id}`
        
        if (isBackRef) {
            
            if (!this.canCreateBackRef(parentEntity, parentId))
                return
            
            // Add a back (child) ref
            this.entities[parentEntity][parentId]['#REFPARENT#'] = refCode
            
        }
        else {
            
            if (!this.canCreateForwardRef(pk, name))
                return
            
            if (!pk[name] || !Array.isArray(pk[name]))
                this.entities[parentEntity][parentId][name] = []
            
            this.entities[parentEntity][parentId][name].push({
                ['#REFCHILD#']: refCode
            })
            
        }
        
    }
    
    parseEntities(o, parentEntity, parentId, needsRef = false) {
        
        if (!o) return this.entities
        this.requireValidObject(o)
        
        this.createEntityMap(o)
        
        const id = this.getEntityId(o)
        const keys = Object.keys(o)
        
        if (!this.firstRun && !id)
            throw new Error(`ID not found, ${id}, for ${o}`)
        this.firstRun = false
        
        for (let key of keys) {
            
            const name = this.formatEntityName(key)
            const value = o[key]
            
            if (Array.isArray(value)) {
                
                value.forEach(it => {
                    
                    const itId = this.getEntityId(it)
                    
                    // Create a forward ref from parent to child
                    this.createRef(parentEntity, id, name, itId)
                    
                    // Parse the entity, adding it to the final result
                    this.parseEntities(it, name, id, true)
                    
                    // Create a back ref from child to parent (now that child exists)
                    if (parentEntity && id)
                        this.createRef(name, itId, parentEntity, id, true)
                    
                })
                
            }
            else if (typeof value === 'object') {
                
                const valueId = this.getEntityId(value)
                
                // Create a forward ref from parent to child
                this.createRef(parentEntity, id, name, valueId)
                
                this.parseEntities(value, name, id)
                
                // Create a back ref from child to parent (now that child exists)
                if (parentEntity && id)
                    this.createRef(name, valueId, parentEntity, id, true)
                
            }
            else {
                
                if (this.opts.logging)
                    console.info(`+ ${parentEntity} / ${id} / ${key} = ${value}`)
                
                this.entities[parentEntity][id] = this.entities[parentEntity][id] || {}
                this.entities[parentEntity][id][key] = value
                
            }
            
        }
        
    }
    
    parse(o) {
        
        if (Array.isArray(o))
            o.forEach(it => this.parseEntities(it))
        else
            this.parseEntities(o)
        
        return this.entities
        
    }
    
}
