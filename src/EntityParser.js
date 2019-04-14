
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
    
    parseEntities(o, parentEntity, parentId) {
        
        this.createEntityMap(o)
        
        const id = o[this.opts.idKey] || null
        const keys = Object.keys(o)
        
        if (!this.firstRun && !id)
            throw new Error('ID not found for ' + stringify(o))
        this.firstRun = false
        
        for (let key of keys) {
            
            const name = this.formatEntityName(key)
            const value = o[key]
            
            if (Array.isArray(value)) {
                value.forEach(it => this.parseEntities(it, name, id))
            }
            else if (typeof value === 'object') {
                this.parseEntities(value, name, id)
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
