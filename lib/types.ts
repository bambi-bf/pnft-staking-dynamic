import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js'

export interface GlobalPool {
    admin: PublicKey,
    reward_per_day: anchor.BN,
    reward_mint: PublicKey,
    reward_enable: boolean
}

export interface UserPool {
    owner: PublicKey,
    itemCount: anchor.BN,
    items: StakedNFT[],
    rewardTime: anchor.BN,
    pendingReward: anchor.BN,
}

export interface StakedNFT {
    nftAddr: PublicKey,
    stakeTime: anchor.BN,
    rewardTime: anchor.BN,
    lockTime: anchor.BN,
    rate: anchor.BN,
}