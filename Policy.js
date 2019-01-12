var SchemaManager =  require('./modules/SchemaManager').SchemaManager

var ChainManager = require('./modules/ChainManager').ChainTable

var PolicyContainer = require('./modules/Policy').PolicyContainer
var fs = require('fs')
var BackupManager = require('./modules/BackupManager')

function loadPolicy(fname) {
    var policy = JSON.parse(fs.readFileSync(fname, {encoding : 'utf-8'}).toString())
    var policyContainer = new PolicyContainer(
        policy.passKeyPath, 
        policy.encryptionAlgorithm, 
        policy.backupWindow, policy.backupPath, 
        policy.enableValidation
    )

    return policyContainer
}

function initializeDatabase(policyContainer) {

    //check if the backup exists with non-zero size:
    if(!fs.existsSync(policyContainer.backupPath+'/schema.db') || !fs.existsSync(policyContainer.backupPath+'/chain.db')) {
        return {
            schemaTable : new SchemaManager(),
            chainTable : new ChainManager()
        }
    }

     var schema_file = fs.readFileSync(policyContainer.backupPath+'/schema.db', {encoding : 'utf-8'}).toString()

     console.log(schema_file)


     if(schema_file.length < 0 || schema_file.length == 0) {
         return {
             schemaTable : new SchemaManager(),
             chainTable : new ChainManager()
         }
     }

     return restore(policyContainer)
}

function backup(schemaTable, chainTable, policyObject) {
    var interval = policyObject.backupWindow
    console.log("Starting backup - manager with backup window : "+interval)
    setInterval(() => {BackupManager.backup(policyObject, schemaTable, chainTable)}, interval)
}

function restore(policyObject) {
    var tables = BackupManager.restore(policyObject)
    return tables
}

module.exports.loadPolicy = loadPolicy
module.exports.backup = backup
module.exports.initDatabase = initializeDatabase
module.exports.restore = restore