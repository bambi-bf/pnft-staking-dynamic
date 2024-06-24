import { Program, Wallet, web3 } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import fs from "fs";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { GLOBAL_AUTHORITY_SEED, PROGRAM_ID, USER_POOL_SEED } from "../lib/constant";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import { IDL } from "../target/types/staking";
import {
  changeAdminTx,
  changeRewardMintTx,
  changeRewardEnableTx,
  changeRewardPerDayTx,
  claimRewardTx,
  createInitUserTx,
  createInitializeTx,
  createLockPnftTx,
  createUnlockPnftTx,
  getGlobalState,
  getRewardVaultTx,
} from "../lib/scripts";
import { GlobalPool, UserPool } from "../lib/types";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

let solConnection: Connection = null;
let program: Program = null;
let provider: anchor.Provider = null;
let payer: NodeWallet = null;

// Address of the deployed program.
let programId = new anchor.web3.PublicKey(PROGRAM_ID);

/**
 * Set cluster, provider, program
 * If rpc != null use rpc, otherwise use cluster param
 * @param cluster - cluster ex. mainnet-beta, devnet ...
 * @param keypair - wallet keypair
 * @param rpc - rpc
 */
export const setClusterConfig = async (
  cluster: web3.Cluster,
  keypair: string,
  rpc?: string
) => {
  if (!rpc) {
    solConnection = new web3.Connection(web3.clusterApiUrl(cluster));
  } else {
    solConnection = new web3.Connection(rpc);
  }

  const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(keypair, "utf-8"))),
    { skipValidation: true }
  );
  const wallet = new NodeWallet(walletKeypair);

  // Configure the client to use the local cluster.
  anchor.setProvider(
    new anchor.AnchorProvider(solConnection, wallet, {
      skipPreflight: true,
      commitment: "confirmed",
    })
  );
  payer = wallet;

  provider = anchor.getProvider();
  console.log("Wallet Address: ", wallet.publicKey.toBase58());

  // Generate the program client from IDL.
  program = new anchor.Program(IDL as anchor.Idl, programId);
  console.log("ProgramId: ", program.programId.toBase58());
};

/**
 * Initialize global pool, vault
 */
export const initProject = async () => {
  try {
    const updateCpIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 5_000_000,
    });
    const updateCuIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 200_000,
    });

    const tx = new Transaction().add(
      updateCpIx,
      updateCuIx,
      await createInitializeTx(payer.publicKey, program)
    );
    const { blockhash, lastValidBlockHeight } =
      await solConnection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer.publicKey;

    payer.signTransaction(tx);

    const txId = await provider.sendAndConfirm(tx, [], {
      commitment: "confirmed",
    });

    console.log("txHash: ", txId);
  } catch (e) {
    console.log(e);
  }
};

/**
 * Change admin of the program
 */
export const changeAdmin = async (newAdmin: string) => {
  let newAdminAddr = null;
  try {
    newAdminAddr = new PublicKey(newAdmin);
  } catch {
    newAdminAddr = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(fs.readFileSync(newAdmin, "utf-8"))),
      { skipValidation: true }
    ).publicKey;
  }

  const tx = await changeAdminTx(payer.publicKey, newAdminAddr, program);

  const txId = await provider.sendAndConfirm(tx, [], {
    commitment: "confirmed",
  });

  console.log("txHash: ", txId);
};

export const changeRewardPerDay = async (newRewardPerDay: number) => {
  const tx = await changeRewardPerDayTx(
    payer.publicKey,
    newRewardPerDay,
    program
  );

  const txId = await provider.sendAndConfirm(tx, [], {
    commitment: "confirmed",
  });

  console.log("txHash: ", txId);
};

export const changeRewardEnable = async (newRewardEnable: number) => {
  const tx = await changeRewardEnableTx(
    payer.publicKey,
    newRewardEnable == 1 ? true : false,
    program
  );

  const txId = await provider.sendAndConfirm(tx, [], {
    commitment: "confirmed",
  });

  console.log("txHash: ", txId);
};

export const changeMint = async (newMint: string) => {
  let newMintAddr = null;
  try {
    newMintAddr = new PublicKey(newMint);
  } catch {
    newMintAddr = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(fs.readFileSync(newMint, "utf-8"))),
      { skipValidation: true }
    ).publicKey;
  }
  const tx = await changeRewardMintTx(payer.publicKey, newMintAddr, program);

  const txId = await provider.sendAndConfirm(tx, [], {
    commitment: "confirmed",
  });

  console.log("txHash: ", txId);
};

/**
 * Initialize user pool
 */
export const initializeUserPool = async () => {
  try {
    const tx = await createInitUserTx(payer.publicKey, program);

    const txId = await provider.sendAndConfirm(tx, [], {
      commitment: "confirmed",
    });

    console.log("txHash: ", txId);
  } catch (e) {
    console.log(e);
  }
};

export const lockPnft = async (nftMint: PublicKey) => {
  try {
    const tx = await createLockPnftTx(
      payer as Wallet,
      nftMint,
      program,
      solConnection
    );

    await addAdminSignAndConfirm(tx);
  } catch (e) {
    console.log(e);
  }
};

export const unlockPnft = async (nftMint: PublicKey) => {
  try {
    const tx = await createUnlockPnftTx(
      payer as Wallet,
      nftMint,
      program,
      solConnection
    );

    await addAdminSignAndConfirm(tx);
  } catch (e) {
    console.log(e);
  }
};

export const claimReward = async () => {
  try {
    const tx = await claimRewardTx(payer.publicKey, program, solConnection);
    const txId = await provider.sendAndConfirm(tx, [], {
      commitment: "confirmed",
    });

    console.log("txHash: ", txId);
  } catch (error) {
    console.log(error);
  }
};

export const getUserState = async (
  user: PublicKey
): Promise<UserPool | null> => {
  let userPoolKey = await PublicKey.createWithSeed(
    user,
    USER_POOL_SEED,
    program.programId
  );
  console.log("userPoolKey: ", userPoolKey.toBase58());

  try {
    let userState = await program.account.userPool.fetch(userPoolKey);
    return userState as unknown as UserPool;
  } catch {
    return null;
  }
};

export const getGlobalInfo = async () => {
  console.log("global pool: ", await getGlobalState(program));
};

export const getRewardVault = async () => {
  console.log("Reward vault: ", getRewardVaultTx(program));
}

export const createInitUser = async () => {
  
}

export const addAdminSignAndConfirm = async (txData: Buffer) => {
  // Deserialize the transaction
  let tx = Transaction.from(txData);

  // Sign the transaction with admin's Keypair
  // tx = await adminWallet.signTransaction(tx);
  // console.log("signed admin: ", adminWallet.publicKey.toBase58());

  const sTx = tx.serialize();

  // Send the raw transaction
  const options = {
    commitment: "confirmed",
    skipPreflight: false,
  };
  // Confirm the transaction
  const signature = await solConnection.sendRawTransaction(sTx, options);
  await solConnection.confirmTransaction(signature, "confirmed");

  console.log("Transaction confirmed:", signature);
};
