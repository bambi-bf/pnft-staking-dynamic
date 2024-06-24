use crate::*;

#[derive(Accounts)]
pub struct InitUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    //  User pool stores user's stake info
    #[account(
        init,
        seeds = [USER_POOL_SEED.as_ref(), user.key().as_ref()],
        bump,
        payer = user,
        space = UserPool::INIT_SIZE,
    )]
    pub user_pool: Account<'info, UserPool>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl InitUser<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>) -> Result<()> {
        let user = &mut ctx.accounts.user_pool;

        let now = Clock::get()?.unix_timestamp;

        user.owner = ctx.accounts.user.key();
        user.reward_time = now;

        Ok(())
    }
}
