use {
    crate::*, 
    anchor_spl::token::{Mint, Token, TokenAccount}, 
    mpl_token_metadata::instructions::{RevokeStakingV1CpiBuilder, UnlockV1CpiBuilder}
};

#[derive(Accounts)]
pub struct UnlockPNFT<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        mut,
        seeds = [USER_POOL_SEED.as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_pool: Account<'info, UserPool>,

    pub token_mint: Box<Account<'info, Mint>>,
    #[account(
        mut, 
        token::mint = token_mint, 
        token::authority = user,
    )]    
    pub token_account: Box<Account<'info, TokenAccount>>,
    /// CHECK instruction will fail if wrong edition is supplied
    pub token_mint_edition: AccountInfo<'info>,
    /// CHECK instruction will fail if wrong record is supplied
    #[account(mut)]
    pub token_mint_record: AccountInfo<'info>,
    /// CHECK instruction will fail if wrong metadata is supplied
    #[account(mut)]
    mint_metadata: UncheckedAccount<'info>,
    /// CHECK instruction will fail if wrong rules are supplied
    pub auth_rules: UncheckedAccount<'info>,
    /// CHECK instruction will fail if wrong sysvar ixns are supplied
    pub sysvar_instructions: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    /// CHECK intstruction will fail if wrong program is supplied
    pub token_metadata_program: AccountInfo<'info>,
    /// CHECK intstruction will fail if wrong program is supplied
    pub auth_rules_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn unlock_pnft_handler(ctx: Context<UnlockPNFT>) -> Result<()> {
    let global_pool = &mut ctx.accounts.global_pool;
    let user_pool = &mut ctx.accounts.user_pool;

    // Check user pool owner matched with signed user
    require!(user_pool.owner.eq(&ctx.accounts.user.key()), StakingError::InvalidOwner);

    let seeds = &[
        GLOBAL_AUTHORITY_SEED.as_bytes(), 
        &[ctx.bumps.global_pool]
    ];
    let delegate_seeds = &[&seeds[..]];

    UnlockV1CpiBuilder::new(&ctx.accounts.token_metadata_program)
        .authority(&global_pool.to_account_info().clone())
        .token_owner(Some(&ctx.accounts.user))
        .token(&ctx.accounts.token_account.to_account_info())
        .mint(&ctx.accounts.token_mint.to_account_info())
        .metadata(&ctx.accounts.mint_metadata)
        .edition(Some(ctx.accounts.token_mint_edition.as_ref()))
        .token_record(Some(ctx.accounts.token_mint_record.as_ref()))
        .payer(&ctx.accounts.user)
        .system_program(&ctx.accounts.system_program)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
        .authorization_rules_program(Some(ctx.accounts.auth_rules_program.as_ref()))
        .authorization_rules(Some(ctx.accounts.auth_rules.as_ref()))
        .invoke_signed(delegate_seeds)?;

    RevokeStakingV1CpiBuilder::new(&ctx.accounts.token_metadata_program)
        .delegate(&global_pool.to_account_info())
        .metadata(&ctx.accounts.mint_metadata.to_account_info())
        .master_edition(Some(ctx.accounts.token_mint_edition.as_ref()))
        .token_record(Some(ctx.accounts.token_mint_record.as_ref()))
        .mint(&ctx.accounts.token_mint.to_account_info())
        .token(&ctx.accounts.token_account.to_account_info())
        .authority(&ctx.accounts.user)
        .payer(&ctx.accounts.user)
        .system_program(&ctx.accounts.system_program)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
        .authorization_rules_program(Some(ctx.accounts.auth_rules_program.as_ref()))
        .authorization_rules(Some(ctx.accounts.auth_rules.as_ref()))
        .invoke()?;

    let timestamp = Clock::get()?.unix_timestamp;

    // Validate if the nft staking exist and remove it
    user_pool.remove_nft(
        ctx.accounts.token_mint.key(), 
        timestamp, 
        global_pool.reward_per_day
        )?;
    
    global_pool.total_staked_count -= 1;

    Ok(())
}