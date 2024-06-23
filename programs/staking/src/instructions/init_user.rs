use crate::*;

#[derive(Accounts)]
pub struct InitUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    //  User pool stores user's stake info
    #[account(mut)]
    pub user_pool: Account<'info, UserPool>,

    //  Needed to init new account
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl InitUser<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>) -> Result<()> {
        let user = &mut ctx.accounts.user_pool;

        user.owner = ctx.accounts.user.key();
        Ok(())
    }
}