use crate::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        space = GlobalPool::DATA_SIZE,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        payer = admin
    )]
    pub global_pool: Account<'info, GlobalPool>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl Initialize<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;

        global_pool.admin = ctx.accounts.admin.key();

        Ok(())
    }
}
