/*

   Implements security policy, used for storage of objects on file-system.
   The format in which chain-tables and schema-tables are stored and methods for reading and dumping them.

   //These policies can be enabled to dump data at regular intervals , policies are defined by policy.json
   //And can be configured, some policies include encryption key, algorithm (Only symmetric and few)
   //Time interval in ms to be dumped (or backed up)

   //the file path of dump log
   
*/
var crypto = require('crypto')
var fs = require('fs')

var supportedAlgorithms = {
    cipher : (text, key, algorithm, decrypt = false) => {

        //console.log(key)
        if(!decrypt) {
            var cipher = crypto.createCipher(algorithm, key)
            var ctext = cipher.update(text, 'utf-8', 'hex')
            ctext += cipher.final('hex')
            return ctext
        }else {
            //console.log(text, key, algorithm, decrypt)
            var dcipher = crypto.createDecipher(algorithm, key)
            var pt = dcipher.update(text, "hex", "utf-8")
            pt += dcipher.final("utf-8")
            return pt
        }
    },

    mix : (passphrase) => {
        var sl1 = passphrase.slice(0, 4)
        var passphrase = passphrase.slice(4 , passphrase.length)
        passphrase += "0x3c3c3c3c3c3c3c3c";
        passphrase  = passphrase + sl1 +"0x55ffd9834544455";
        passphrase =  "0x441333" +sl1 + passphrase + "0x33145533335555";

        return passphrase
    },

    generateKeyFromPassPhrase : (mixedPassphrase) => {
        var md5 = crypto.createHash('md5')
        var hx = md5.update(mixedPassphrase).digest('hex')

        return hx
    }
}

function encrypt(plaintext, passphrase, algorithm) {
    var mixedPassPhrase = supportedAlgorithms.mix(passphrase)
    var key = supportedAlgorithms.generateKeyFromPassPhrase(mixedPassPhrase)
    //console.log("Encryption Key : "+ key)
    return supportedAlgorithms.cipher(plaintext, key, 'aes256')
}

function decrypt(cipher, passphrase, algorithm) {
    var mixedPassPhrase = supportedAlgorithms.mix(passphrase)
    var key = supportedAlgorithms.generateKeyFromPassPhrase(mixedPassPhrase)
    //console.log("Decryption Key : "+key)
    return supportedAlgorithms.cipher(cipher, key, 'aes256', true)
}


module.exports.encrypt = encrypt
module.exports.decrypt = decrypt



class PolicyContainer {
    constructor(passkeyPath, encryptionAlgorithm, backupWindow, backupPath, enableValidation) {
        this.passKeyPath = passkeyPath;
        this.encryptionAlgorithm = encryptionAlgorithm;
        this.backupWindow = backupWindow;
        this.backupPath = backupPath;
        this.enableValidation = enableValidation;
    }
}

module.exports.PolicyContainer = PolicyContainer