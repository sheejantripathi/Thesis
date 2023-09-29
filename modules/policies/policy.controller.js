const mongoose = require("mongoose");
const moment = require("moment");
const { uploadFileIPFS } = require("../../helpers/utils");
// const { ERR } = require("../../helpers");
const Model = require("./policy.model");




const { ObjectId } = mongoose.Types;

class PolicyController {
  async heliaFileUploader(fileData) {
    const { createHelia } = await import('helia')
    const { unixfs } = await import('@helia/unixfs')
    const { MemoryBlockstore } =await import('blockstore-core')
    const blockstore = new MemoryBlockstore()

    // create a Helia node
    const helia = await createHelia({
      blockstore
    })

    // create a filesystem on top of Helia, in this case it's UnixFS
    const fs = unixfs(helia)

    // we will use this TextEncoder to turn strings into Uint8Arrays
    const encoder = new TextEncoder()

    // add the bytes to your node and receive a unique content identifier
    const cid = await fs.addBytes(encoder.encode(fileData))
    const fileHash = cid.toString()

    return fileHash;

    console.log('Added file:', cid.toString())

    // create a second Helia node using the same blockstore
    const helia2 = await createHelia({
      blockstore
    })

    // create a second filesystem
    const fs2 = unixfs(helia2)

    // this decoder will turn Uint8Arrays into strings
    const decoder = new TextDecoder()
    let text = ''

    // read the file from the blockstore using the second Helia node
    for await (const chunk of fs2.cat(cid)) {
      text += decoder.decode(chunk, {
        stream: true
      })
    }

    console.log('Added file contents:', text)
  }
  async addPolicy(payload, fileContent) {
    //versioning of the new-policies based on the timestamp
    let fileUploadResult = await this.heliaFileUploader(fileContent);
    const policy_version = moment(Date.now()).format("YYYY-MM-DD-HHmmss");
    payload.policy_version = `POLICY-${payload.assetId}-${policy_version}`;
    payload.fileHash = fileUploadResult;

    const policypayload = { ...payload };
    console.log(policypayload)
    return
    return await Model.create(policypayload);
  }

  newPolicy(payload) {
    return Model.create(payload);
  }

  getById(id) {
    return Model.findById(id);
  }

  getByName(name) {
    return Model.findOne(name);
  }
}

module.exports = new PolicyController();
