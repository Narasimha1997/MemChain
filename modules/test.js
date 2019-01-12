var SchemaManager = require('./SchemaManager').SchemaManager
var ChainTable = require('./ChainManager').ChainTable

var backupManager = require('./BackupManager').backup

var restoreManager = require('./BackupManager').restore

var PolicyContainer = require('./Policy').PolicyContainer

var fs = require('fs')

//This demo creates 2 schemas and also provides 2 high level functions write() and read()

function loadPolicy(fname) {
    var policy = JSON.parse(fs.readFileSync(fname, {encoding : 'utf-8'}).toString())
    var policyContainer = new PolicyContainer(
        policy.passKeyPath, 
        policy.encryptionAlgorithm, 
        policy.backupWindow, policy.backupPath, 
        policy.enableValidation
    )

    console.log(policyContainer)

    return policyContainer
}

var schemaManager = new SchemaManager()
schemaManager.addSchema("students", {name : 'string', usn : 'string', 'age' : 'number'})

var chainTable = new ChainTable()


function write(name, object) {
    var studentSchema = schemaManager.obtainSchema("students")

    var k1 = chainTable.addToChain("students", {
        name : "Narasimha",
        "usn" : "1KS15CS062",
        "age" : 21
    }, studentSchema)

    var k2 = chainTable.addToChain("students", {
        name : "Prasanna",
        "usn" : "1KS15CS062",
        "age" : 21
    }, studentSchema)

    var k3 = chainTable.addToChain("students", {
        name : "HN",
        "usn" : "1KS15CS062",
        "age" : 21
    }, studentSchema)

    backupManager(loadPolicy('../policy.json'), schemaManager, chainTable)
    //var objects = restoreManager(loadPolicy('../policy.json'))

    return [k1, k2, k3]

    
}

keys = write()

function read(keys) {
    for(var i = 0; i < keys.length; i++) {
        console.log(keys[i])
        var obj = chainTable.retrive("students", keys[i], true)
        console.log(obj)
    }
}

read(keys)

//var keys = write("xxxx", 'xxxxx')

/*var objects = restoreManager(loadPolicy('../policy.json'))

console.log(objects.chainTable.retrive("students", "e8f1d6968899b76780844440d1cf1866"))


var k2 = objects.chainTable.addToChain("students", {
    name : "LOAD",
    usn : "1KS",
    "age" : 50,
}, schemaManager.obtainSchema("students"))
console.log(objects.chainTable.retrive('students', k2))*/

//read(keys)