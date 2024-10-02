import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
  SendTransactionError,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { getKeypairFromFile } from "@solana-developers/helpers";
import { BN } from "bn.js";

async function main() {
  try {
    const programId = new PublicKey(
      "8difcQwqE5ZbzbMzNr9VFrP4K5MbzVckkLnGDFV8gukZ"
    );

    // Connect to a solana cluster. Either to your local test validator or to devnet
    const connection = new Connection("http://localhost:8899", "confirmed");
    //const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // We load the keypair that we created in a previous step
    const keyPair = await getKeypairFromFile("~/.config/solana/id.json");

    // Every transaction requires a blockhash

    // Create a new transaction

    const greetedAccount = Keypair.generate();
    const greetedAccountSize = 4;
    console.log(
      "newAccountPubkey greetedAccount: ",
      greetedAccount.publicKey.toBase58()
    );

    let tmp = Keypair.generate();
    
    console.log('tmp.publicKey: ',tmp.publicKey.toBase58());

    const createAccountInstruction = SystemProgram.createAccount({
      // from where sol would be deducted
      fromPubkey: keyPair.publicKey,
      // new pub id o accound
      newAccountPubkey: greetedAccount.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        greetedAccountSize
      ),
      space: greetedAccountSize,
      // owner program of account
      programId

      // it would execute errorless
      // moreover even though tmp does not pointing to valid program on chain, even then
      // would be assigned as value of account's program_id key
      //  but does not make any sense
      // programId:tmp.publicKey,
    });

    const txn = new Transaction();

    txn.add(createAccountInstruction);
    //   keypair,greetedAccount = [deductedFrom, transferedTo]
    // this is the order
    // if kept same then would not be created as program address already would be running on pubKey
    const hash = await sendAndConfirmTransaction(connection, txn, [
      keyPair,
      greetedAccount,
    ]);
    console.log("hash: ", hash);  
    // return

      const xyz = Keypair.generate();

      const sig = await connection.requestAirdrop(
        xyz.publicKey,
        1000000000
      );
      await connection.confirmTransaction(sig);

      const lamports = await connection.getBalance(xyz.publicKey);
      console.log`lamports: ${lamports}`

      for (let i = 0; i < 1; i++) {

      const blockhashInfo = await connection.getLatestBlockhash();

      const tx = new Transaction({
        ...blockhashInfo,
        feePayer: xyz.publicKey,
      });

      const numberToBuffer = (num: number) => {
        const bn = new BN(num);
        const bnArr = bn.toArray().reverse();
        const bnBuffer = Buffer.from(bnArr);
        const zeroPad = Buffer.alloc(4);
        bnBuffer.copy(zeroPad);
        return zeroPad;
      };

      const buffers = [Buffer.from(Int8Array.from([0])), numberToBuffer(5)];
      const data = Buffer.concat(buffers);
 
      //   // Add our Hello World instruction
      tx.add(
        new TransactionInstruction({
          programId: programId,
          keys: [
            {
              pubkey: greetedAccount.publicKey, // The greeted account
              isSigner: false,
              isWritable: true,
            },
          ],
          data: data,
        })
      );

      /*
        
Transaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.
Transaction references a signature that is unnecessary, only the fee payer and instruction signer accounts should sign a transaction. This behavior is deprecated and will throw an error in the next major version release.
        */

      //   const txHash = await sendAndConfirmTransaction(connection, tx, [keyPair]);
      //
      //   // Sign the transaction with your previously created keypair

      tx.sign(xyz);
      // tx.sign(keyPair);

      //   // Send the transaction to the Solana network
      const txHash = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: true,
      });

      //   console.log("Transaction sent with hash:", txnHash);

      await connection.confirmTransaction({
        blockhash: blockhashInfo.blockhash,
        lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
        signature: txHash,
      });

      console.log(
        `Congratulations! Look at your ‘Hello World' transaction in the Solana Explorer:
          https://explorer.solana.com/tx/${txHash}?cluster=custom`
      );
    }
  } catch (error) {
    console.error("error: ", error);

    // error.getLogs()
  }
}

main();
