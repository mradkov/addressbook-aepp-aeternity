/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
const Ae = require('@aeternity/aepp-sdk').Universal;
const Crypto = require('@aeternity/aepp-sdk').Crypto;

const config = {
  host: "http://localhost:3001/",
  internalHost: "http://localhost:3001/internal/",
  contractSourcePath: "./contracts/AddressBook.aes",
  gas: 200000,
  ttl: 55
}

describe('AddressBook Contract', () => {

  let owner;
  let nonOwner;
  let contractSource;
  let compiledContract;
  let contractInstance;

  before(async () => {
    owner = await Ae({
      url: config.host,
      internalUrl: config.internalHost,
      keypair: wallets[0],
      nativeMode: true,
      networkId: 'ae_devnet'
    });

    nonOwner = await Ae({
      url: config.host,
      internalUrl: config.internalHost,
      keypair: wallets[1],
      nativeMode: true,
      networkId: 'ae_devnet'
    });

    // Read the source file
    contractSource = utils.readFileRelative(config.contractSourcePath, "utf-8");
    compiledContract = await owner.contractCompile(contractSource, { // Compile it
      gas: config.gas
    })

    contractInstance = await compiledContract.deploy({ // Deploy it
      options: {
        ttl: config.ttl,
      },
      abi: "sophia"
    });
  })

  it('Deploying AddressBook Contract', async () => {
    assert(contractInstance, 'Could not deploy the AddressBook Smart Contract'); // Check it is deployed
  })

  it('Should store provided person correctly', async () => {
    let address = "0x" + Crypto.decodeBase58Check(wallets[0].publicKey.split('_')[1]).toString('hex');  //wallets[0]; 
    let first_name = "Milen";
    let last_name = "Radkov";
    let age = 25;

    // Call add Person function
    const addPerson = await owner.contractCall(compiledContract.bytecode, 'sophia', contractInstance.address, "addPerson", {
      args: `(${address}, "${first_name}", "${last_name}", ${age})`,
      options: {
        ttl: config.ttl
      },
      abi: "sophia"
    })

    const addPersonResult = await addPerson.decode('bool');
    assert.equal(addPersonResult.value, true, "Person is not added successfully");
  })

  it('Should get person data correctly correctly', async () => {
    let address = "0x" + Crypto.decodeBase58Check(wallets[0].publicKey.split('_')[1]).toString('hex'); 
    let first_name = "Milen";
    let last_name = "Radkov";
    let age = 25;

    // Call addPerson function
    const addPerson = await owner.contractCall(compiledContract.bytecode, 'sophia', contractInstance.address, "addPerson", {
      args: `(${address}, "${first_name}", "${last_name}", ${age})`,
      options: {
        ttl: config.ttl
      },
      abi: "sophia"
    })

    // Call getPerson function
    const getPerson = await owner.contractCall(compiledContract.bytecode, 'sophia', contractInstance.address, "getPerson", {
      args: `(${address})`,
      options: {
        ttl: config.ttl
      },
      abi: "sophia"
    })

   	const getPersonResult = await getPerson.decode('(string,string,int)');
	
	assert.equal(getPersonResult.value[0].value, first_name, "Person first name does not match");
	assert.equal(getPersonResult.value[1].value, last_name, "Person last name not match");
	assert.equal(getPersonResult.value[2].value, age, "Person age does not match");
  })
})
