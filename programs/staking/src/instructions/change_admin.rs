use crate::*;

#[derive(Accounts)]
pub struct ChangeAdmin<'info> {
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

impl ChangeAdmin<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, new_admin: Pubkey) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;

        // Don't need check admin since it signed the transaction
        global_pool.admin = new_admin;

        Ok(())
    }
}