
var express = require('express');
var bp = require('body-parser');

var Policy = require('./Policy')

var app = express()

app.use(bp.json())


if(process.argv.length <= 2) {
    console.log('Pass argument POLICY_PATH')
    process.exit(0)
}

var policy = Policy.loadPolicy(process.argv[2]) // example Policy file

var restoredTables = Policy.initDatabase(policy)

var schemaTable = restoredTables.schemaTable


var chainTable = restoredTables.chainTable

Policy.backup(schemaTable, chainTable, policy)

app.post('/api/create', (req, resp) => {
    var name = req.body.name
    var schema = req.body.schema

    schemaTable.addSchema(name, schema)
    chainTable.createChain(name)
    resp.send(JSON.stringify({success : true}))

})

app.post('/api/retrive', (req, resp) => {
    var name = req.body.name
    var accessKey = req.body.accessKey

    if(!chainTable.checkAccessKey(name, accessKey)) {
        resp.send(JSON.stringify({success : false, output : 'Invalid access key'}))
        return
    }

    var result = chainTable.retrive(name, accessKey, false)

    if(result == null) {
        resp.send(JSON.stringify({success : false, output : 'Object not found'}))
    }else resp.send(JSON.stringify({success : true, output : result}))
})

app.post('/api/insert', (req, resp) => {
    var name = req.body.name
    var data = req.body.object
    var schema = schemaTable.obtainSchema(name)
    if(schema == null) {
        resp.send(JSON.stringify({
            accessKey : 'no-schema'
        }))
    }
    var accessKey = chainTable.addToChain(name, data, schema)
    if(accessKey == null) {
        resp.send(JSON.stringify({accessKey : 'Falied to create an accessKey, object not inserted'}))
    }else resp.send(JSON.stringify({accessKey : accessKey, time : new Date().toString()}))
})

app.listen(8000, 'localhost', () => {
    console.log("Server running... ... ..")
})