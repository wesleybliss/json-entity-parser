#!/usr/bin/env babel-node

import EntityParser from '../src/EntityParser'

import superheros from './sample-data/superheros'
import splashHostEntities from './sample-data/splash-host-entities'

/*([superheros, splashHostEntities]).forEach(it => {
    const ep = new EntityParser({ idKey: 'id' })
    const res = ep.parse(it)
    console.log(JSON.stringify(res, null, 4))
})*/

const data = /*splashHostEntities*/ superheros

console.log('ORIGINAL JSON\n', JSON.stringify(data, null, 4))

const ep = new EntityParser({ idKey: 'id', logging: true })

const em = ep.createEntityMap(data)
console.log('ENTITY MAP\n', JSON.stringify(em, null, 4))

const xx = ep.parse(data)
console.log('PARSED ENTITIES\n', JSON.stringify(xx, null, 4))
