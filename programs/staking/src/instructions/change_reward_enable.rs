use crate::*;

#[derive(Accounts)]
pub struct ChangeRewardEnable<'info> {
    // Current admin
    #[account(
        mut,
        constraint = global_pool.admin == *admin.key @StakingError::InvalidAdmin
    )]
    pub admin: Signer<'info>,

    //  Global pool stores admin address
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump
    )]
    pub global_pool: Account<'info, GlobalPool>,
}

impl ChangeRewardEnable<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, new_reward_enable: bool) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;
        msg!("enable {}",new_reward_enable);
        // Don't need check admin since it signed the transaction
        global_pool.reward_enable = new_reward_enable;

        Ok(())
    }
}