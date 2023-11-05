const LitJsSdk = require('@lit-protocol/lit-node-client-nodejs');
const ethers = require("ethers");
const siwe = require("siwe");

const client = new LitJsSdk.LitNodeClientNodeJs();
const chain = "ethereum";

const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "ethereum",
      method: "eth_getBalance",
      parameters: [":userAddress", "latest"],
      returnValueTest: {
        comparator: ">=",
        value: "0", // 0.0 ETH
      },
    },
  ];

class Lit {
    litNodeClient
  
    async connect() {
      await client.connect()
      this.litNodeClient = client
    }

    async encrypt(message) {
        if (!this.litNodeClient) {
          await this.connect()
        }
    
        const authSig = await this.createAuthSig();
        const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(message)
        console.log(encryptedString, 'encryptedString')
    return
        const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
          accessControlConditions,
          symmetricKey,
          authSig,
          chain,
        })
    
        return {
          encryptedString,
          encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
        }
      }

async createAuthSig() {
        // Initialize the signer
//   const wallet = new ethers.Wallet('722ae4bf8fd1faec4ba751e2a5803626575d25f682e38912870b69a6fd696bda');
//   const address = ethers.getAddress(await wallet.getAddress());
const privKey = "722ae4bf8fd1faec4ba751e2a5803626575d25f682e38912870b69a6fd696bda"
//   const address = '0xf28FB703F0fE9e7b36dabD041c2945c4DC92CeDC';
const privKeyBuffer = require("uint8arrays").fromString(privKey, "base16");
const wallet = new ethers.Wallet(privKeyBuffer);
console.log(wallet.address, 'address')

return
  // Craft the SIWE message
  const domain = 'localhost';
  const origin = 'https://localhost:3000';
  const statement =
    'Nevoremore, quoth the raven, nevermore.';
  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: '1',
    chainId: '11155111',
  });

  console.log(siweMessage, 'siweMessage')
  const messageToSign = siweMessage.prepareMessage();

  console.log(messageToSign, 'messageToSign')
  
  // Sign the message and format the authSig
  const signature = await wallet.signMessage(messageToSign);

  console.log(signature, 'signature')

  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: address,
  };

  console.log(authSig);
  }
}

  const litAF = new Lit()
  const result = litAF.encrypt('Hello WOrld')
  console.log(result, 'result')
  
//   export default new Lit()
