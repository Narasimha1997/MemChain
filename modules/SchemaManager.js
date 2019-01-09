var fs = require('fs')

class SchemaManager {

    loadFromFile(loadFrom) {
        return JSON.parse(fs.readFileSync(loadFrom, {encoding : 'utf-8'}))
    }

    /*
      This object will contain an in-memory Schema Table, This table is a JS object "schemaTable",
      Acts as an assiociative map <schema-name, schema-table>, providing O(1) method without assiociative search
      The method dump() can be used to create a persistent file-system storage of schema
      can be loaded to memory by specifying loadFrom parameter as file-name.

      The in-memory system will provide fast-access to schema whenever required
    */

    constructor(loadFrom = null) {
        this.schemaTable = (loadFrom == null) ? {} : this.loadFromFile(loadFrom)
    }

    addSchema(name, schema) {
        this.schemaTable[name] = schema
    }

    obtainSchema(name) {
        return this.schemaTable[name]
    }

    dump(fp) {
        fs.write(fp, JSON.stringify(this.schemaTable), (err) => {
            console.log(err)
        })
    }
}

module.exports.SchemaManager = SchemaManager