import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    TransactionInstruction,
  } from "@solana/web3.js";
  import { getKeypairFromFile } from "@solana-developers/helpers";


async function main() {
    try {
        
       
      const programId = new PublicKey("DwUrsE5HnSFiBT4giSibd84PzS6vXPmeVqzJaqDfuXzJ");
       
      // Connect to a solana cluster. Either to your local test validator or to devnet
      const connection = new Connection("http://localhost:8899", "confirmed");
      //const connection = new Connection("https://api.devnet.solana.com", "confirmed");
       
      // We load the keypair that we created in a previous step
      const keyPair = await getKeypairFromFile("~/.config/solana/id.json");
       
      // Every transaction requires a blockhash
      const blockhashInfo = await connection.getLatestBlockhash();
       
      // Create a new transaction
      const tx = new Transaction({
        ...blockhashInfo,
      });

      const greetedAccount = Keypair.generate();
      
      console.log('greetedAccount: ',greetedAccount.publicKey.toBase58());

      // Add our Hello World instruction
      tx.add(
        new TransactionInstruction({
          programId: programId,
          keys: [
            {
                pubkey:greetedAccount.publicKey, // The greeted account
                isSigner: false,
                isWritable: true,
            },
        ],
          data: Buffer.from([]),
        }),
      );

      // Sign the transaction with your previously created keypair
      tx.sign(keyPair);
       
      // Send the transaction to the Solana network
      const txHash = await connection.sendRawTransaction(tx.serialize());
       
      console.log("Transaction sent with hash:", txHash);
       
      await connection.confirmTransaction({
        blockhash: blockhashInfo.blockhash,
        lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
        signature: txHash,
      });
       
      console.log(
        `Congratulations! Look at your ‘Hello World' transaction in the Solana Explorer:
        https://explorer.solana.com/tx/${txHash}?cluster=custom`,
      );

    } catch (error) {
        console.error('error: ',error)
    }
}


main()