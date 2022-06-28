const Web3 = require('web3');
var Web3HttpProvider = require('web3-providers-http');
const fs = require('fs');
var Tx = require('ethereumjs-tx');

let rawdata = fs.readFileSync('./bridgeABI.json');
let abiJSON = JSON.parse(rawdata);

let contractAddress = "0x06c30Af8A82AAf9cFd319f8644584276Bfbec42f"
let tokenAddress = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" //USDC
let privateKey = ""
const privateKeyBuffer = Buffer.from(privateKey, 'hex')
let tokenID = 1 // 1 is polygon
let bonus = true

var provider = new Web3HttpProvider('https://bsc-dataseed.binance.org');
const web3 = new Web3(provider);

let account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.defaultAccount = account.address
// web3.eth.personal.importRawKey(privateKey, "")

var contractABI = new web3.eth.Contract(abiJSON, contractAddress);
let amount = 12 // 12$
let depositData = contractABI.methods
    .deposit(tokenAddress, BigInt(amount * Math.pow(10, 18)), tokenID, bonus, account.address)
    .encodeABI()

web3.eth.getTransactionCount(web3.eth.defaultAccount, (err, txCount) => {
    if (err) {
        console.log(err)
    }

    console.log("txCount:", txCount)
    // Build the transaction
    const txObject = {
        nonce: web3.utils.toHex(txCount),
        to: contractAddress,
        value: web3.utils.toHex(web3.utils.toWei("0", 'milli')),
        gasLimit: web3.utils.toHex(96673),
        gasPrice: web3.utils.toHex(web3.utils.toWei('5', 'gwei')),
        data: depositData
    }
    // Sign the transaction
    const tx = new Tx(txObject);
    tx.sign(privateKeyBuffer);

    const serializedTx = tx.serialize();
    const raw = '0x' + serializedTx.toString('hex');

    // Broadcast the transaction
    web3.eth.sendSignedTransaction(raw, (err, tx) => {
        console.log("tx:", tx)
    }).catch(err => {
        console.log(err)
    })
}).catch(err => {
    console.log(err)
})
