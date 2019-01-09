var ObjectManager  = require('./Object').ObjectManager

var SchemaManager  = require('./SchemaManager').SchemaManager;
var ChainTable = require('./ChainManager').ChainTable;

var fs = require('fs')
var policyMethods = require('./Policy')

function write(fp, data) {
    fs.writeFile(fp, data, (err) => console.log(err))
}

function createObject(object, schemaTable, name) {
    var obj = new ObjectManager(
        object.userobject,
        schemaTable.obtainSchema(name),
        object.previousHash,
        object.timestamp,
        (err) => console.log(err)
    )
    var result = obj.createObject()

    return result.object
}

function loadSchemaTable(schemaJSON) {
    var schemaTable = new SchemaManager()
    schemaTable.schemaTable = schemaJSON

    return schemaTable
}

function loadChainTable (chainTableJSON, schemaTable) {
    var chainTable = new ChainTable()

    var topLevelNames = Object.keys(chainTableJSON)

    for(var i = 0 ; i < topLevelNames.length; i++) {
        var accessKeys = Object.keys(chainTableJSON[topLevelNames[i]])
        chainTable.createChain(topLevelNames[i])

        for(var j = 0; j < accessKeys.length; j++) {
            var key = accessKeys[j]
            chainTable.chainTable[topLevelNames[i]].chain[key] = createObject(
                chainTableJSON[topLevelNames[i]][key],
                schemaTable,
                topLevelNames[i]
            )
        }
    }

    return chainTable
}

function backup (policyObject, schemaTable, chainTable) {

    if(Object.keys(chainTable.chainTable).length == 0 || Object.keys(schemaTable.schemaTable).length == 0) {
        console.log("No data found, skipping backup..")
        return
    }

    var passKey = fs.readFileSync(policyObject.passKeyPath, {encoding : 'utf-8'}).toString()

    var data = schemaTable.schemaTable
    data = JSON.stringify(data)

    var cts = policyMethods.encrypt(data, passKey)
    write(policyObject.backupPath+'/schema.db', cts)

    //Backup chain table and ChainTable and their chain objects

    //Prepare <chain-name, chain> pair

    var chains = {}
    var keys = Object.keys(schemaTable.schemaTable)


    for(var i = 0; i < keys.length; i++) {
        var chain = chainTable.chainTable
        var chains_readable = {}
        var accessKeys = Object.keys(chain[keys[i]].chain)
        for(var j = 0; j < accessKeys.length; j++) {
            chains_readable[accessKeys[j]] = chain[keys[i]].chain[accessKeys[j]]
        }

        chains[keys[i]] = chains_readable
    }

    var textData = JSON.stringify(chains)
    var pt = policyMethods.encrypt(textData, passKey)

    write(policyObject.backupPath+'/chain.db', pt)
}

function restore(policyObject) {
    var passKey = fs.readFileSync(policyObject.passKeyPath, {encoding : 'utf-8'}).toString()

    var schema = fs.readFileSync(policyObject.backupPath+'/schema.db', {encoding : 'utf-8'}).toString()

    //console.log(schema)

    var scJSON = JSON.parse(policyMethods.decrypt(schema, passKey))

    var schemaTable = loadSchemaTable(scJSON)
    
    var chain = fs.readFileSync(policyObject.backupPath+'/chain.db', {encoding : 'utf-8'}).toString()
    var cJSON = JSON.parse(policyMethods.decrypt(chain, passKey))
    var chainTable = loadChainTable(cJSON, schemaTable)


    return {schemaTable : schemaTable, chainTable : chainTable}
}

module.exports.backup = backup
module.exports.restore = restore 