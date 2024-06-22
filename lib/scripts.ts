import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  Connection,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PROGRAM_ID as TOKEN_AUTH_RULES_ID } from "@metaplex-foundation/mpl-token-auth-rules";

import {
  METAPLEX,
  MPL_DEFAULT_RULE_SET,
  findTokenRecordPda,
  getATokenAccountsNeedCreate,
  getAssociatedTokenAccount,
  getMasterEdition,
  getMetadata,
} from "./util";
import {
  ADMIN_ADDRESS,
  GLOBAL_AUTHORITY_SEED,
  REWARD_TOKEN_MINT,
  USER_POOL_SEED,
  USER_POOL_SIZE,
} from "./constant";

export const createInitializeTx = async (
  userAddress: PublicKey,
  program: anchor.Program
) => {
  const [globalPool, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("globalPool: ", globalPool.toBase58());

  const txId = await program.methods
    .initialize()
    .accounts({
      admin: userAddress,
      globalPool,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .transaction();

  return txId;
};

/**
 * Change admin of the program
 */
export const changeAdminTx = async (
  admin: PublicKey,
  newAdminAddr: PublicKey,
  program: anchor.Program
) => {
  const [globalPool, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  const tx = await program.methods
    .changeRewardEnv(newAdminAddr, null, null, null)
    .accounts({
      admin,
      globalPool,
    })
    .transaction();

  return tx;
};

export const changeRewardPerDayTx = async (
  admin: PublicKey,
  newReward: number,
  program: anchor.Program
) => {
  const [globalPool, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  const tx = await program.methods
    .changeRewardEnv(null, null, null, new anchor.BN(newReward))
    .accounts({
      admin,
      globalPool,
    })
    .transaction();

  return tx;
};

export const changeMintTx = async (
  admin: PublicKey,
  newMint: PublicKey,
  program: anchor.Program
) => {
  const [globalPool, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  const tx = await program.methods
    .changeRewardEnv(null, newMint, null, null)
    .accounts({
      admin,
      globalPool,
    })
    .transaction();

  return tx;
};

export const getGlobalState = async (program: anchor.Program) => {
  const [globalPool, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("globalPool: ", globalPool.toBase58());
  let globalPoolData = await program.account.globalPool.fetch(globalPool);
  console.log("global pool data: ", globalPoolData);

  const rewardVault = await getAssociatedTokenAccount(
    globalPool,
    REWARD_TOKEN_MINT
  );
  console.log(rewardVault.toBase58());
};

export const changeRewardEnableTx = async (
  admin: PublicKey,
  newEnable: number,
  program: anchor.Program
) => {
  const [globalPool, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  let newEnableBoolean = newEnable == 0 ? false : true;
  const tx = await program.methods
    .changeRewardEnv(null, null, newEnableBoolean, null)
    .accounts({
      admin,
      globalPool,
    })
    .transaction();

  return tx;
};

export const createInitUserTx = async (
  userAddress: PublicKey,
  solConnection: Connection,
  program: anchor.Program
) => {
  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

  console.log("userPool: ", userPoolKey.toBase58());

  let ix = SystemProgram.createAccountWithSeed({
    fromPubkey: userAddress,
    basePubkey: userAddress,
    seed: "user-pool",
    newAccountPubkey: userPoolKey,
    lamports: await solConnection.getMinimumBalanceForRentExemption(
      USER_POOL_SIZE
    ),
    space: USER_POOL_SIZE,
    programId: program.programId,
  });

  const txId = await program.methods
    .initUser()
    .accounts({
      user: userAddress,
      userPool: userPoolKey,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .preInstructions([ix])
    .transaction();

  return txId;
};

export const createLockPnftTx = async (
  wallet: Wallet,
  nftMint: PublicKey,
  program: anchor.Program,
  connection: Connection
) => {
  const userAddress = wallet.publicKey;

  const [globalPool, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("globalPool: ", globalPool.toBase58());

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );
  console.log("userPool: ", userPoolKey.toBase58());

  const nftEdition = await getMasterEdition(nftMint);
  console.log("nftEdition: ", nftEdition.toBase58());

  let tokenAccount = await getAssociatedTokenAccount(userAddress, nftMint);
  console.log("tokenAccount: ", tokenAccount.toBase58());

  const mintMetadata = await getMetadata(nftMint);
  console.log("mintMetadata: ", mintMetadata.toBase58());

  const tokenMintRecord = findTokenRecordPda(nftMint, tokenAccount);
  console.log("tokenMintRecord: ", tokenMintRecord.toBase58());

  const tx = new Transaction();

  let poolAccount = await connection.getAccountInfo(userPoolKey);
  if (poolAccount === null || poolAccount.data === null) {
    console.log("init User Pool");
    const tx_initUserPool = await createInitUserTx(
      userAddress,
      connection,
      program
    );
    tx.add(tx_initUserPool);
  }
  console.log("=======");
  const txId = await program.methods
    .lockPnft(new anchor.BN(0))
    .accounts({
      globalPool,
      tokenAccount,
      tokenMint: nftMint,
      tokenMintEdition: nftEdition,
      tokenMintRecord,
      mintMetadata,
      authRules: MPL_DEFAULT_RULE_SET,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      signer: userAddress,
      userPool: userPoolKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: METAPLEX,
      authRulesProgram: TOKEN_AUTH_RULES_ID,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  tx.add(txId);

  tx.feePayer = userAddress;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const txData = await wallet.signTransaction(tx);

  console.log("signed user: ", userAddress.toBase58());

  return txData.serialize({ requireAllSignatures: false });
};

export const claimRewardTx = async (
  userAddress: PublicKey,
  program: anchor.Program,
  connection: Connection
) => {
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  console.log("globalAuthority =", globalAuthority.toBase58());

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );

  console.log("user pool: ", await program.account.userPool.fetch(userPoolKey));

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    connection,
    userAddress,
    userAddress,
    [REWARD_TOKEN_MINT]
  );

  const rewardVault = await getAssociatedTokenAccount(
    globalAuthority,
    REWARD_TOKEN_MINT
  );

  const txId = await program.methods
    .claimReward()
    .accounts({
      owner: userAddress,
      userPool: userPoolKey,
      globalAuthority,
      rewardVault,
      userRewardAccount: destinationAccounts[0],
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .preInstructions([...instructions])
    .transaction();

  return txId;
};

export const createUnlockPnftTx = async (
  wallet: Wallet,
  nftMint: PublicKey,
  program: anchor.Program,
  connection: Connection
) => {
  const userAddress = wallet.publicKey;

  const [globalPool, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("globalPool: ", globalPool.toBase58());

  let userPoolKey = await PublicKey.createWithSeed(
    userAddress,
    "user-pool",
    program.programId
  );
  console.log("userPool: ", userPoolKey.toBase58());

  const nftEdition = await getMasterEdition(nftMint);
  console.log("nftEdition: ", nftEdition.toBase58());

  let tokenAccount = await getAssociatedTokenAccount(userAddress, nftMint);
  console.log("tokenAccount: ", tokenAccount.toBase58());

  const mintMetadata = await getMetadata(nftMint);
  console.log("mintMetadata: ", mintMetadata.toBase58());

  const tokenMintRecord = findTokenRecordPda(nftMint, tokenAccount);
  console.log("tokenMintRecord: ", tokenMintRecord.toBase58());

  const tx = new Transaction();

  const txId = await program.methods
    .unlockPnft()
    .accounts({
      admin: ADMIN_ADDRESS,
      globalPool,
      tokenAccount,
      tokenMint: nftMint,
      tokenMintEdition: nftEdition,
      tokenMintRecord,
      mintMetadata,
      authRules: MPL_DEFAULT_RULE_SET,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      signer: userAddress,
      userPool: userPoolKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: METAPLEX,
      authRulesProgram: TOKEN_AUTH_RULES_ID,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  tx.add(txId);

  tx.feePayer = userAddress;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const txData = await wallet.signTransaction(tx);

  console.log("signed user: ", userAddress.toBase58());

  return txData.serialize({ requireAllSignatures: false });
};
