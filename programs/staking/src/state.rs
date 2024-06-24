use anchor_lang::prelude::*;

use crate::constant::*;
use crate::error::*;
#[account]
pub struct GlobalPool {
    pub admin: Pubkey,
    pub reward_per_day: u64,
    pub reward_mint: Pubkey,
    pub reward_enable: bool,
    pub total_staked_count: u64,
    pub extra: u128,
}

impl Default for GlobalPool {
    #[inline]
    fn default() -> GlobalPool {
        GlobalPool {
            admin: Pubkey::default(),
            reward_per_day: 0,
            reward_mint: Pubkey::default(),
            reward_enable: false,
            total_staked_count: 0,
            extra: 0,
        }
    }
}

impl GlobalPool {
    pub const DATA_SIZE: usize = 8 + std::mem::size_of::<GlobalPool>();
}

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone)]
pub struct StakedNFT {
    pub nft_addr: Pubkey,
    pub stake_time: i64,
    pub extra: u128, // tbh for extra setting
}

#[account]
pub struct UserPool {
    pub owner: Pubkey,
    pub item_count: u64,
    pub reward_time: i64,
    pub pending_reward: u64,
    pub extra: u128,
    pub items: Vec<StakedNFT>,
}

impl Default for UserPool {
    #[inline]
    fn default() -> UserPool {
        UserPool {
            owner: Pubkey::default(),
            item_count: 0,
            reward_time: 0,
            pending_reward: 0,
            extra: 0,
            items: Vec::with_capacity(DEFAULT_STAKE_SIZE),
        }
    }
}

impl UserPool {
    pub const STAKING_SIZE: usize = std::mem::size_of::<StakedNFT>();
    pub const INIT_SIZE: usize = 8 + 32 + 8 + 8 + 8 + 16 + 4;

    pub fn size_calc(count: u64) -> usize {
        UserPool::INIT_SIZE + UserPool::STAKING_SIZE * (count as usize)
    }

    pub fn add_nft(&mut self, item: StakedNFT) {
        self.items.push(item);
        self.item_count += 1;
    }

    pub fn remove_nft(&mut self, nft_mint: Pubkey, now: i64, reward_per_day: u64) -> Result<u64> {
        let mut withdrawn: u8 = 0;
        let mut reward: u64 = 0;
        for i in 0..self.item_count {
            let index = i as usize;
            if self.items[index].nft_addr.eq(&nft_mint) {
                let mut last_reward_time: i64 = self.items[index].stake_time;
                if last_reward_time < self.reward_time {
                    last_reward_time = self.reward_time
                }
                reward = ((now as u128 - last_reward_time as u128) * reward_per_day as u128 / DAY as u128) as u64;

                // remove nft
                if i != self.item_count - 1 {
                    let last_idx = self.item_count - 1;
                    self.items[index] = self.items[last_idx as usize].clone();
                }
                self.item_count -= 1;
                self.pending_reward = self.pending_reward.checked_add(reward).unwrap();
                withdrawn = 1;
                break;
            }
        }
        require!(withdrawn == 1, StakingError::InvalidNFTAddress);
        Ok(reward)
    }

    pub fn claim_reward(&mut self, now: i64, reward_per_day: u64) -> Result<u64> {
        let mut reward: u64 = 0;
        for i in 0..self.item_count {
            let index = i as usize;
            let mut last_reward_time: i64 = self.items[index].stake_time;
            if last_reward_time < self.reward_time {
                last_reward_time = self.reward_time
            }
            reward = ((now as u128 - last_reward_time as u128) * reward_per_day as u128 / DAY as u128) as u64;
        }

        reward = reward.checked_add(self.pending_reward).unwrap();
        self.pending_reward = 0;
        self.reward_time = now;
        Ok(reward)
    }
}
