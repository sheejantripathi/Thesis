const fs = require('fs');
const { createHash } = require('crypto');
const ipfsAPI = require('ipfs-api');


const ipfs = ipfsAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

function uploadFileIPFS(filePath) {
    // Read the content of the uploaded file
  const fileContent = fs.readFileSync(filePath);


  // Encrypt the file content (you'll need to replace 'your_secret_key' with your actual encryption key)
  const encryptedContent = encrypt(fileContent, 'your_secret_key');

  // Generate the hash of the encrypted content
  const hashOfEncryptedContent = generateHash(encryptedContent);

  console.log('Hash of encrypted content:', hashOfEncryptedContent);


//Creating buffer for ipfs function to add file to the system


  // Upload the encrypted content to IPFS
  ipfs.add(encryptedContent, (err, result) => {
    if (err) {
      console.error('Error uploading to IPFS:', err);
      return res.status(500).send('Error uploading to IPFS.');
    } else {
      const ipfsHash = result[0].path;
      console.log('File uploaded to IPFS. CID:', ipfsHash);
      return({ ipfsHash, hashOfEncryptedContent });
    }
  });
}

// Function to encrypt content
function encrypt(content, key) {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
  return encrypted;
}

// Function to generate hash
function generateHash(content) {
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

module.exports = {uploadFileIPFS}
