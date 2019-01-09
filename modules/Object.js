var crypto = require('crypto')

class ObjectManager {

    constructor(userobject, objectSchema, previousHash, timestamp, event) {

        this.object = {
            previousHash : previousHash,
            timestamp : timestamp,
            userobject : this.confirmSchemaAndCreate(userobject, objectSchema, event),
            hash : ''
        }
    }

    confirmSchemaAndCreate(object, objectSchema, event) {
        var keys = Object.keys(object)
        var newObject = {}
        for(var i = 0; i < keys.length; i++) 
            if ( (typeof(objectSchema[keys[i]]) != 'undefined') && (typeof(object[keys[i]]) == objectSchema[keys[i]]) )
              newObject[keys[i]] = object[keys[i]]
            else {
                event("Error : Schema Validation Failed")
                return
            }
        return newObject
    }

    computeHash(object) {
        return crypto.createHash('md5').update(JSON.stringify(object)).digest('hex')
    }

    createObject() {
        this.object.hash = this.computeHash(this.object)
        return {object : this.object, accessKey : this.object.hash}
    }
}

module.exports.ObjectManager = ObjectManager