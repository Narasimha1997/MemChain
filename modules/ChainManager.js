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
        this.accessKeys = []
    }

    obtainPreviousHash() {
        //traverse the chain, and obtain the next hash until the last:
        var keys = Object.keys(this.chain)
        
    }

    add(object, schema) {
        var previousHash = (this.accessKeys.length > 0)? this.accessKeys[this.accessKeys.length - 1]: "0xfff3d";
        console.log(previousHash)
        var obj = prepareObject(object, schema, previousHash, (e) => console.log(e))
        obj.seqNumber = Object.keys(this.chain).length + 1;
        this.chain[obj.accessKey] = obj.object
        //console.log(this.chain)
        this.accessKeys.push(obj.accessKey)
        return obj.accessKey
    }

    computeHash(object) {
        return crypto.createHash("md5").update(JSON.stringify(object), "utf-8").digest("hex")
    }

    retrive(key, withValidation = false) {
        //console.log(this.accessKeys)
        if(!withValidation) {
            //O(1) 
            return this.chain[key].userobject
        }else {

            if(this.accessKeys.length == 1) {
                return (this.computeHash(this.chain[this.accessKeys[0]]) == key) ? 
                this.chain[key].userobject 
                : {error : "Tamper detected", tamperedObject : prepareObject, nextObject : containerObject};
            }


            //TODO : Implement after validate() method
            for(var i = 1; i < this.accessKeys.length; i++) {
                var previousObject = this.chain[this.accessKeys[i - 1]]
                previousObject.hash = ""
                var previousHash = this.computeHash(previousObject)
                var containerObject = this.chain[this.accessKeys[i]]

                //console.log(previousHash, containerObject.previousHash)

                if(containerObject.previousHash !== previousHash) {
                    return {error : "Tamper detected", tamperedObject : previousObject, nextObject : containerObject}
                }
            }

            return this.chain[key].userobject
        }
    }

    validate() {
        //write your own validation if necessary and call it in the code 
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

   getAccessKeys(name) {
       return Object.keys(this.chainTable[name].chain)
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