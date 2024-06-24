use crate::*;

#[derive(Accounts)]
pub struct ChangeRewardEnv<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        has_one = admin @ StakingError::InvalidAdmin,
    )]
    pub global_pool: Account<'info, GlobalPool>,
}

impl ChangeRewardEnv<'_> {
    pub fn process_instruction(
        ctx: &mut Context<Self>,
        new_admin: Option<Pubkey>,
        new_reward_mint: Option<Pubkey>,
        new_reward_enable: Option<bool>,
        new_reward_per_day: Option<u64>,
    ) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;

        // Don't need check admin since it signed the transaction
        global_pool.admin = new_admin.unwrap_or(global_pool.admin);
        global_pool.reward_mint = new_reward_mint.unwrap_or(global_pool.reward_mint);
        global_pool.reward_enable = new_reward_enable.unwrap_or(global_pool.reward_enable);
        global_pool.reward_per_day = new_reward_per_day.unwrap_or(global_pool.reward_per_day);

        Ok(())
    }
}
