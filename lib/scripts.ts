import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  Connection,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";

import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
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
} from "./constant";

export const createInitializeTx = async (
  admin: PublicKey,
  program: anchor.Program
) => {
  const [globalPool] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("globalPool: ", globalPool.toBase58());

  const tx = await program.methods
    .initialize()
    .accounts({
      admin,
      globalPool,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .transaction();

  return tx;
};

/**
 * Change admin of the program as old admin
 */
export const changeAdminTx = async (
  admin: PublicKey,
  newAdminAddr: PublicKey,
  program: anchor.Program
) => {
  const [globalPool] = PublicKey.findProgramAddressSync(
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

/**
 * Change reward rate per day as admin
 */
export const changeRewardPerDayTx = async (
  admin: PublicKey,
  newReward: number,
  program: anchor.Program
) => {
  const [globalPool] = PublicKey.findProgramAddressSync(
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

/**
 * Change reward mint as admin
 */
export const changeRewardMintTx = async (
  admin: PublicKey,
  newRewardMint: PublicKey,
  program: anchor.Program
) => {
  const [globalPool] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  const tx = await program.methods
    .changeRewardEnv(null, newRewardMint, null, null)
    .accounts({
      admin,
      globalPool,
    })
    .transaction();

  return tx;
};

/**
 * Enable / disable reward as admin
 */
export const changeRewardEnableTx = async (
  admin: PublicKey,
  newState: boolean,
  program: anchor.Program
) => {
  const [globalPool] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  const tx = await program.methods
    .changeRewardEnv(null, null, newState, null)
    .accounts({
      admin,
      globalPool,
    })
    .transaction();

  return tx;
};

/**
 * Initialize UserPool PDA
 */
export const createInitUserTx = async (
  userAddress: PublicKey,
  program: anchor.Program
) => {
  // let userPoolKey = await PublicKey.createWithSeed(
  //   userAddress,
  //   USER_POOL_SEED,
  //   program.programId
  // );

  const [userPool] = PublicKey.findProgramAddressSync([
    Buffer.from(USER_POOL_SEED),
    userAddress.toBytes(),
  ], program.programId);

  // TODO: remove debug log
  console.log(`userPool: ${userPool.toString()}`);

  const tx = await program.methods
    .initUser()
    .accounts({
      user: userAddress,
      userPool,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .transaction();

  return tx;
};

export const createLockPnftTx = async (
  wallet: Wallet,
  nftMint: PublicKey,
  program: anchor.Program,
  connection: Connection
) => {
  const userAddress = wallet.publicKey;

  const [globalPool] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("globalPool: ", globalPool.toBase58());

  // let userPoolKey = await PublicKey.createWithSeed(
  //   userAddress,
  //   USER_POOL_SEED,
  //   program.programId
  // );
  const [userPool] = PublicKey.findProgramAddressSync([
    Buffer.from(USER_POOL_SEED),
    userAddress.toBytes(),
  ], program.programId);
  console.log("userPool: ", userPool.toBase58());

  const nftEdition = await getMasterEdition(nftMint);
  console.log("nftEdition: ", nftEdition.toBase58());

  let tokenAccount = await getAssociatedTokenAccount(userAddress, nftMint);
  console.log("tokenAccount: ", tokenAccount.toBase58());

  const mintMetadata = await getMetadata(nftMint);
  console.log("mintMetadata: ", mintMetadata.toBase58());

  const tokenMintRecord = findTokenRecordPda(nftMint, tokenAccount);
  console.log("tokenMintRecord: ", tokenMintRecord.toBase58());

  const tx = new Transaction();

  let poolAccount = await connection.getAccountInfo(userPool);
  if (poolAccount === null || poolAccount.data === null) {
    console.log("init User Pool");
    const tx_initUserPool = await createInitUserTx(
      userAddress,
      program
    );
    tx.add(tx_initUserPool);
  }
  console.log("=======");
  const txId = await program.methods
    .lockPnft()
    .accounts({
      user: userAddress,
      globalPool,
      userPool: userPool,
      tokenMint: nftMint,
      tokenAccount,
      tokenMintEdition: nftEdition,
      tokenMintRecord,
      mintMetadata,
      authRules: MPL_DEFAULT_RULE_SET,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
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
  const [globalPool] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  console.log("globalPool =", globalPool.toBase58());

  // let userPoolKey = await PublicKey.createWithSeed(
  //   userAddress,
  //   USER_POOL_SEED,
  //   program.programId
  // );
  const [userPool] = PublicKey.findProgramAddressSync([
    Buffer.from(USER_POOL_SEED),
    userAddress.toBytes(),
  ], program.programId);

  console.log("user pool: ", await program.account.userPool.fetch(userPool));

  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    connection,
    userAddress,
    userAddress,
    [REWARD_TOKEN_MINT]
  );

  const rewardVault = await getAssociatedTokenAccount(
    globalPool,
    REWARD_TOKEN_MINT
  );

  console.log("reward vault: ", rewardVault);

  const txId = await program.methods
    .claimReward()
    .accounts({
      user: userAddress,
      globalPool,
      userPool: userPool,
      rewardMint: REWARD_TOKEN_MINT,
      rewardVault,
      userRewardAccount: destinationAccounts[0],
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      SystemProgram: SystemProgram.programId
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

  const [globalPool] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log("globalPool: ", globalPool.toBase58());

  // let userPoolKey = await PublicKey.createWithSeed(
  //   userAddress,
  //   USER_POOL_SEED,
  //   program.programId
  // );
  const [userPool] = PublicKey.findProgramAddressSync([
    Buffer.from(USER_POOL_SEED),
    userAddress.toBytes(),
  ], program.programId);
  console.log("userPool: ", userPool.toBase58());

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
      userPool: userPool,
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

/**
 * Fetch global pool PDA data
 */
export const getGlobalState = async (program: anchor.Program) => {
  const [globalPool] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  let globalPoolData = await program.account.globalPool.fetch(globalPool);

  return {
    key: globalPool,
    data: globalPoolData,
  }
};

/**
 * Fetch global reward vault account balance
 */
export const getRewardVaultTx = async (program: anchor.Program) => {
  const [globalPool] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  const rewardVault = await getAssociatedTokenAccount(
    globalPool,
    REWARD_TOKEN_MINT
  );

  const balance = await program.provider.connection.getTokenAccountBalance(rewardVault);

  return {
    key: rewardVault,
    balance,
  }
};
