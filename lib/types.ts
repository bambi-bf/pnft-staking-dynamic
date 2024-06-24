import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js'

export interface GlobalPool {
    admin: PublicKey,
    rewardPerDay: anchor.BN,
    rewardMint: PublicKey,
    rewardEnable: boolean,
    totalStakedCount: anchor.BN,
    extra: anchor.BN,
}

export interface UserPool {
    owner: PublicKey,
    itemCount: anchor.BN,
    rewardTime: anchor.BN,
    pendingReward: anchor.BN,
    extra: anchor.BN,
    items: StakedNFT[],
}

export interface StakedNFT {
    nftAddr: PublicKey,
    stakeTime: anchor.BN,
    extra: anchor.BN,
}