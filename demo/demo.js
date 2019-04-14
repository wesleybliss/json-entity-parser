#!/usr/bin/env babel-node

import EntityParser from '../src/EntityParser'
import superheros from './sample-data/superheros'

const data = superheros

//console.log('ORIGINAL JSON\n', JSON.stringify(data, null, 4))

const ep = new EntityParser({ idKey: 'id', logging: false })

const em = ep.createEntityMap(data)
console.log('ENTITY MAP\n', JSON.stringify(em, null, 4))

const xx = ep.parse(data)
console.log('PARSED ENTITIES\n', JSON.stringify(xx, null, 4))
