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

const Universal = require('@aeternity/aepp-sdk').Universal;
const MemoryAccount = require('@aeternity/aepp-sdk').MemoryAccount;
const CONTRACT_SOURCE = utils.readFileRelative('./contracts/address-book.aes', 'utf-8');

describe('Address Book Contract', () => {

    let contract, client;

    before(async () => {
        client = await Universal({
            url: "http://localhost:3001",
            internalUrl: "http://localhost:3001/internal",
            accounts: [
                MemoryAccount({keypair: wallets[0]}),
                MemoryAccount({keypair: wallets[1]}),
                MemoryAccount({keypair: wallets[2]}),
                MemoryAccount({keypair: wallets[3]})
            ],
            networkId: "ae_devnet",
            compilerUrl: "http://localhost:3080"
        })
    });

    beforeEach(async () => {
        contract = await client.getContractInstance(CONTRACT_SOURCE);
        const init = await contract.deploy([]);
        assert.equal(init.result.returnType, 'ok');
    });

    it('Deploy AddressBook Contract', async () => {
        contract = await client.getContractInstance(CONTRACT_SOURCE);
        const deploy = await contract.deploy([]);
        assert.equal(deploy.result.returnType, 'ok');
    });

    it('Should store provided person correctly', async () => {
      let dummyPerson = {
        firstName: 'Dummy',
        lastName: 'Person',
        age: 42
      }
      let result = await contract.methods.add_person(wallets[1].publicKey, dummyPerson.firstName, dummyPerson.lastName, dummyPerson.age);
      assert.equal(result.result.returnType, 'ok');
    })

    it('Should read person correctly', async () => {
      let dummyPerson = {
        firstName: 'Dummy',
        lastName: 'Person',
        age: 42
      }
      let result = await contract.methods.add_person(wallets[1].publicKey, dummyPerson.firstName, dummyPerson.lastName, dummyPerson.age);
      assert.equal(result.result.returnType, 'ok');

      let read = await contract.methods.get_person(wallets[1].publicKey);

      assert.equal(dummyPerson.firstName, read.decodedResult.first_name, 'First name does not match');
      assert.equal(dummyPerson.lastName, read.decodedResult.last_name, 'Last name does not match');
      assert.equal(dummyPerson.age, read.decodedResult.age, 'Age does not match');
    })
});
