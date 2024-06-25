# Pnft-Staking-Contract

## Install Dependencies

- Install `node` and `yarn`
- Install `script` as global command
- Confirm the solana wallet preparation. ex: `key.json`

## Usage

- Main script source for all functionality is here: `/lib/script.ts`
- Program account types are declared here: `/lib/types.ts`

Able to test the script functions working in this way.

- Change commands properly in the main functions of the `script.ts` file to call the other functions
- Run `yarn script` with parameters

# Features

## How to deploy this program?

First of all, you have to git clone in your PC.
In the folder `staking`, in the terminal

1. `yarn`

2. `anchor build`
   In the last sentence you can see:

```
To deploy this program:
  $ solana program deploy ./target/deploy/staking.so
The program address will default to this keypair (override with --program-id):
  ./target/deploy/staking-keypair.json
```

3. `solana-keygen pubkey ./target/deploy/staking.json`
4. You can get the pubkey of the `program ID : ex."5N...x6k"`
5. Please add this pubkey to the lib.rs
   `declare_id!("5N...x6k");`
6. Please add this pubkey to the Anchor.toml
   `staking = "5N...x6k"`
7. `anchor build` again
8. `solana program deploy ./target/deploy/staking.so`

<p align = "center">
Then, you can enjoy this program 
</p>
</br>

## How to use?

### A Project Admin

First of all, open the directory and `yarn`

#### Initialize project

```js
   yarn script init
```

As soon as after deploy program, admin need to initialize and should \
deposit reward token to vault if reward enabled

#### Get global pool info

```js
   yarn script status
```

Check the global pool info and reward vault balance

#### Update reward thresholds as Admin

- Transfer admin authority
```js
   yarn script change-admin -n <NEW ADMIN ADDRESS>
```

- Active / Disable reward
```js
   yarn script change-reward-enable -n <ENABLED>
```
To enable reward, set the reward_enable to 1. else set it 0

- Change reward token mint
```js
   yarn script change-reward-mint -m <NEW REWARD MINT>
```

- Change daily reward rate
```js
   yarn script change-reward-per-day -n <REWARD RATE PER DAY>
```
Reward per day should be token amount in decimal expected to receive everyday


### A User

#### Lock NFT for stake

```js
   yarn script lock -m <MINT ADDRESS>
```

#### Unlock NFT for unstake

```js
   yarn script unstake -m <MINT ADDRESS>
```

#### Claim user generated rewards

```js
   yarn script claim-reward
```

#### Get user status

```js
   yarn script user-status -a <USER_ADDRESS>
```

