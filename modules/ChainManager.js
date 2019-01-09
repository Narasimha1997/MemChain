var crypto = require('crypto')
var OBJManager = require('./Object').ObjectManager
var fs = require('fs')


var prepareObject = (object, schema, previousHash, event) => {
    var obj = new OBJManager(object, schema, previousHash, new Date().toString(), event)

    return obj.createObject()
}

class Chain {

    constructor() {
        this.chain = {}
    }

    add(object, schema) {
        var obj = prepareObject(object, schema, "", (e) => console.log(e))
        obj.seqNumber = Object.keys(this.chain).length + 1;
        this.chain[obj.accessKey] = obj.object
        //console.log(this.chain)
        return obj.accessKey

    }

    retrive(key, withValidation = false) {
        if(!withValidation) {
            //O(1) 
            return this.chain[key].userobject
        }else {
            //TODO : Implement after validate() method
        }
    }
    validate() {

    }

}

class ChainTable {
    /*
      ChainTable is an in-memory <name, chain> table, chains are accessed with respect to their names
      to retrive an object from ChainTable, specify (name : string, accessKey : string, validation : boolean)
      Here is how it works : 
      1. Retrives chain for that name, using name as key
      2. Since each chain is a blockchain based hash-map, each object can be directly accessed without assiociative search
         on the chain, using accessKey as hash. Here accessKey is the Tx-Hash variant of blockchain system.
      3. Blockchain's concept of block-validation is performed on each block and is computed using previousHash of each block
         Enable validation on retrival time by setting withValidation = true,
         NOTE : Validation will add additional complexity varying linearly with chain size.
         if validation is turned off, then retrival will be O(1) operation because of hash-map.
    */
   loadFromFile(loadFromFile) {
       return JSON.parse(fs.readFileSync(loadFromFile, {encoding : 'utf-8'}))
   }

   checkAccessKey(name, key) {
       if(this.chainTable[name].chain[key] == 'undefined') return false
       return true
   }

   constructor(loadFile = null) {
       this.chainTable = (loadFile == null) ? {} : this.loadFromFile(loadFile)
   }

   createChain(name) {
       this.chainTable[name] = new Chain()
   }

   addToChain(name, object, schema) {
       if(typeof(this.chainTable[name]) == 'undefined') 
          this.createChain(name)
       return this.chainTable[name].add(object, schema)
       
   }

   retrive(name, accessKey, withValidation = false) {
       return this.chainTable[name].retrive(accessKey, withValidation)
   } 
}

module.exports.ChainTable = ChainTable