// const fs = require('fs');
// const { createHash } = require('crypto');
// const {create} = require("ipfs-http-client");

// async function ipfsClient() {
//     const ipfs = await create(
//         {
//            host:"ipfs.infura.io",
//            port:"5001",
//            protocol:"https" 
//         }
//     );
//   return ipfs;  
// }

// async function saveText() {
//     let ipfs = await ipfsClient();

//     let result = await ipfs.add("hello");
//     console.log(result);
// }

// saveText()

// // const ipfs = IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

// // function uploadFileIPFS(filePath) {
// //     // Read the content of the uploaded file
// //   const fileContent = fs.readFileSync(filePath);

// //   const encryptionKey = crypto.randomBytes(32).toString('hex');
// //   // Encrypt the file content (you'll need to replace 'your_secret_key' with your actual encryption key)
// //   const encryptedContent = encrypt(fileContent, encryptionKey);

// //   // Generate the hash of the encrypted content
// //   const hashOfEncryptedContent = generateHash(encryptedContent);

// //   console.log('Hash of encrypted content:', hashOfEncryptedContent);


// // //Creating buffer for ipfs function to add file to the system


// // // Upload the file content to IPFS
// // ipfs.add(file.data)
// //   .then((result) => {
// //     console.log('File uploaded to IPFS. CID:', result[0].hash);
// //     // Here, you can store the CID in your database or perform further actions
// //   })
// //   .catch((error) => {
// //     console.error('Error uploading to IPFS:', error);
// //   });

// // }

// // // Function to encrypt content
// // function encrypt(content, key) {
// //   const cipher = crypto.createCipher('aes-256-cbc', key);
// //   const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
// //   return encrypted;
// // }

// // // Function to generate hash
// // function generateHash(content) {
// //   const hash = createHash('sha256');
// //   hash.update(content);
// //   return hash.digest('hex');
// // }

// module.exports = {uploadFileIPFS}
