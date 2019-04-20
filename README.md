# JSON Entity Parser

JSON_EP parses raw JSON & extracts flat entities with references, similar to Mongoose or Realm models.

## Install
```shell
$ git clone --depth=1 <repo> <dir>
$ cd <dir>
$ yarn
```

## Build
```shell
$ yarn build
```
> Files will be output to `./dist`

## Demo
```shell
$ yarn demo
```

## CLI
```shell
$ entity-parser /foo/bar/my.json
```

### Options

| Param   | Type      | Default | Description |
|---------|-----------|---------|-------------|
| --idkey | String    | id      | ID key, typically "id" or "_id" (MongoDB) |
| --logging | Boolean | false   | Enable or disable logging |
