use {
    crate::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{self, Mint, Token, TokenAccount, Transfer},
    },
};

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        has_one = reward_mint,
    )]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        mut,
        seeds = [USER_POOL_SEED.as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_pool: Account<'info, UserPool>,

    pub reward_mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = reward_mint,
        associated_token::authority = global_pool,
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        associated_token::mint = reward_mint,
        associated_token::authority = user,
        payer = user,
    )]
    pub user_reward_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn claim_reward_handler(ctx: Context<ClaimReward>) -> Result<()> {
    let global_pool = &mut ctx.accounts.global_pool;
    let user_pool = &mut ctx.accounts.user_pool;

    // Validate if reward enabled
    require!(
        global_pool.reward_enable == true,
        StakingError::DisabledReward
    );

    let timestamp = Clock::get()?.unix_timestamp;
    let reward: u64 = user_pool.claim_reward(timestamp, global_pool.reward_per_day)?;
    msg!("Reward: {}", reward);

    // Validate reward vault balance enough
    require!(
        ctx.accounts.reward_vault.amount > reward,
        StakingError::LackVaultBalance
    );

    let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[ctx.bumps.global_pool]];
    let signer = &[&seeds[..]];
    let token_program = ctx.accounts.token_program.to_account_info();
    let cpi_accounts = Transfer {
        from: ctx.accounts.reward_vault.to_account_info(),
        to: ctx.accounts.user_reward_account.to_account_info(),
        authority: ctx.accounts.global_pool.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(token_program.clone(), cpi_accounts, signer),
        reward,
    )?;

    Ok(())
}
