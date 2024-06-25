import { program } from "commander";
import { PublicKey } from "@solana/web3.js";
import {
  changeAdmin,
  changeRewardMint,
  changeRewardEnable,
  changeRewardPerDay,
  claimReward,
  getGlobalInfo,
  initProject,
  initializeUserPool,
  lockPnft,
  setClusterConfig,
  unlockPnft,
  getUserInfo,
} from "./scripts";

// program.version('0.0.1');

programCommand("status")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);
    await setClusterConfig(env, keypair, rpc);

    console.log(await getGlobalInfo());
  });

programCommand("init")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);

    await setClusterConfig(env, keypair, rpc);

    await initProject();
  });

programCommand("change-admin")
  .option("-a, --new_admin <string>", "new admin address")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, new_admin } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);
    await setClusterConfig(env, keypair, rpc);

    if (new_admin === undefined) {
      console.log("Error New Admin Input");
      return;
    }

    //  update global info
    await changeAdmin(new_admin);
  });

programCommand("change-reward-per-day")
  .option("-n, --new_reward_per_day <number>", "new reward per day")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, new_reward_per_day } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);
    await setClusterConfig(env, keypair, rpc);

    if (new_reward_per_day === undefined) {
      console.log("Error New reward Input");
      return;
    }

    //  update global info
    await changeRewardPerDay(new_reward_per_day);
  });

programCommand("change-reward-enable")
  .option("-n, --new_reward_enable <number>", "new reward enable")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, new_reward_enable } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);
    await setClusterConfig(env, keypair, rpc);

    if (new_reward_enable === undefined) {
      console.log("Error New reward enable Input");
      return;
    }

    //  update global info
    await changeRewardEnable(new_reward_enable);
  });

programCommand("change-reward-mint")
  .option("-m, --new_mint <string>", "new reward mint")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, new_mint } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);
    await setClusterConfig(env, keypair, rpc);

    if (new_mint === undefined) {
      console.log("Error New mint Input");
      return;
    }

    //  update global info
    await changeRewardMint(new_mint);
  });

programCommand("lock")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .option("-m, --mint <string>")
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, mint } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);

    await setClusterConfig(env, keypair, rpc);
    if (mint === undefined) {
      console.log("Error token amount Input");
      return;
    }

    await lockPnft(new PublicKey(mint));
  });

programCommand("unlock")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .option("-m, --mint <string>")
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, mint } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);

    await setClusterConfig(env, keypair, rpc);
    if (mint === undefined) {
      console.log("Error token amount Input");
      return;
    }

    await unlockPnft(new PublicKey(mint));
  });

programCommand("claim-reward")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);

    await setClusterConfig(env, keypair, rpc);

    await claimReward();
  });

programCommand("user-status")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .option("-a, --user_address <string>")
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, user_address } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);

    await setClusterConfig(env, keypair, rpc);

    await getUserInfo(new PublicKey(user_address));
  });

  programCommand("init-user")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log("Solana Cluster:", env);
    console.log("Keypair Path:", keypair);
    console.log("RPC URL:", rpc);

    await setClusterConfig(env, keypair, rpc);

    await initializeUserPool();
  });

function programCommand(name: string) {
  return (
    program
      .command(name)
      .option("-e, --env <string>", "Solana cluster env name", "devnet-beta") //mainnet-beta, testnet, devnet
      .option(
        "-r, --rpc <string>",
        "Solana cluster RPC name",
        "https://devnet.helius-rpc.com/?api-key=44b7171f-7de7-4e68-9d08-eff1ef7529bd"
      )
      // .option('-r, --rpc <string>', 'Solana cluster RPC name', 'https://mainnet.helius-rpc.com/?api-key=99c6d984-537e-4569-955b-5e4703b73c0d')
      .option(
        "-k, --keypair <string>",
        "Solana wallet Keypair Path",
        "./key.json"
      )
  );
}

program.parse(process.argv);

/*

yarn script init
yarn script change-admin -n J9ja5QkewwMi9kG6JkCNxfLK9CoDGk3F4hZTNKQaKZe3
yarn script lock -m BV3bvkBqVawTghH4uCaba3MGgYs63XyxwX9CeULwvmKG

https://solana-mainnet.g.alchemy.com/v2/wsOJ8IVuGPfyljRfcZjpLrsVQu0_of-j

yarn script unlock -m AXXfo3sggcMLNvz3zRS2wJz8xy78DFbxmgcsUYkM5TzQ -k ../key/G2.json

yarn script user-status -a G2sc5mU3eLRkbRupnupzB3NTzZ85bnc9L1ReAre9dzFU
yarn script user-status -a 4EjZ4sGnvfLbW89AAzSehob7Rmkym7vCH3SMcThSx9q1

yarn script get-users
yarn script status

*/
