use anchor_lang::{prelude::*, AnchorDeserialize};

pub mod constant;
pub mod error;
pub mod instructions;
pub mod state;
pub mod util;
use constant::*;
use error::*;
use instructions::*;
use state::*;
use util::*;

declare_id!("BXxRvgXLLh3Vfah9Ed9AnPGXo64GGqyit6jDku5sPrds");

#[program]
pub mod staking {
    use super::*;

    /**
     * Initialize global pool
     * super admin sets to the caller of this instruction
     */
    pub fn initialize(mut ctx: Context<Initialize>) -> Result<()> {
        Initialize::process_instruction(&mut ctx)
    }

    //  Admin can config reward env
    pub fn change_reward_env(
        mut ctx: Context<ChangeRewardEnv>,
        new_admin: Option<Pubkey>,
        new_reward_mint: Option<Pubkey>,
        new_reward_enable: Option<bool>,
        new_reward_per_day: Option<u64>,
    ) -> Result<()> {
        ChangeRewardEnv::process_instruction(
            &mut ctx,
            new_admin,
            new_reward_mint,
            new_reward_enable,
            new_reward_per_day,
        )
    }

    //  Initialize user pool
    pub fn init_user(mut ctx: Context<InitUser>) -> Result<()> {
        InitUser::process_instruction(&mut ctx)
    }

    /**
     * User can lock pNFTs from specific collection
     */
    pub fn lock_pnft(ctx: Context<LockPNFT>) -> Result<()> {
        lock_pnft::lock_pnft_handler(ctx)
    }

    /**
     * User can claim reward
     */
    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        claim_reward::claim_reward_handler(ctx)
    }

    /**
     * User can unlock pNFTs when they want
     */
    pub fn unlock_pnft(ctx: Context<UnlockPNFT>) -> Result<()> {
        unlock_pnft::unlock_pnft_handler(ctx)
    }
}
