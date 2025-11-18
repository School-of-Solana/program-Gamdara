import * as anchor from "@coral-xyz/anchor";

const PROGRAM_ID = new anchor.web3.PublicKey(
  "3ekPFgdBXUEFQwY1kDqfMpebP68jxba65erehQwcd8zw" // replace with your program id
);

const main = async () => {
  // Use env provider (ANCHOR_PROVIDER_URL + ANCHOR_WALLET)
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load IDL & program
  const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
  if (!idl) throw new Error("IDL not found for program");
  const program = new anchor.Program(idl,  provider);

  // Example: derive a PDA if your initialize needs it
  const [statePda, stateBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), provider.wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );

  console.log("Using state PDA:", statePda.toBase58());

  // Call your initialize instruction
  const txSig = await program.methods
    // .initialize()              // if no args
    // .initialize(stateBump)     // if it takes bump or args
    .initialize()
    .accounts({
      // fill this based on your #[derive(Accounts)] for initialize
      // example:
      // state: statePda,
      // authority: provider.wallet.publicKey,
      // systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Initialized on devnet with tx:", txSig);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
