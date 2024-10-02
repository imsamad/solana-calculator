import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
    TransactionInstruction,
  } from "@solana/web3.js";
  import { getKeypairFromFile } from "@solana-developers/helpers";
  import { BN } from "bn.js";
  
  async function main() {
    try {
      const programId = new PublicKey("8difcQwqE5ZbzbMzNr9VFrP4K5MbzVckkLnGDFV8gukZ");
  
      // Connect to local test validator or devnet
      const connection = new Connection("http://localhost:8899", "confirmed");
      // const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
      // Load the keypair
      const keyPair = await getKeypairFromFile("~/.config/solana/id.json");
  
      // Create new greeted account
      const greetedAccount = Keypair.generate();
      const greetedAccountSize = 4;
      console.log("newAccountPubkey greetedAccount: ", greetedAccount.publicKey.toBase58());
  
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: keyPair.publicKey,
        newAccountPubkey: greetedAccount.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(greetedAccountSize),
        space: greetedAccountSize,
        programId,
      });
  
      const txn = new Transaction().add(createAccountInstruction);
  
      // Send transaction
      const hash = await sendAndConfirmTransaction(connection, txn, [keyPair, greetedAccount]);
      console.log("hash: ", hash);
  
      // Generate a new account and airdrop SOL
      const xyz = Keypair.generate();
      const sig = await connection.requestAirdrop(xyz.publicKey, 1000000000);
      await connection.confirmTransaction(sig);
  
      const lamports = await connection.getBalance(xyz.publicKey);
      console.log(`lamports: ${lamports}`);
  
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
  
        tx.add(
          new TransactionInstruction({
            programId: programId,
            keys: [
              {
                pubkey: greetedAccount.publicKey,
                isSigner: false,
                isWritable: true,
              },
            ],
            data: data,
          })
        );
  
        tx.sign(xyz);
  
        const txHash = await connection.sendRawTransaction(tx.serialize(), {
          skipPreflight: true,
        });
  
        await connection.confirmTransaction({
          blockhash: blockhashInfo.blockhash,
          lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
          signature: txHash,
        });
  
        console.log(
          `Congratulations! View your ‘Hello World' transaction in the Solana Explorer: https://explorer.solana.com/tx/${txHash}?cluster=custom`
        );
      }
    } catch (error) {
      console.error("error: ", error);
    }
  }
  
  main();
  