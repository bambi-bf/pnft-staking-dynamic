use {
    crate::*, 
    anchor_spl::token::{Mint, Token, TokenAccount}, 
    mpl_token_metadata::instructions::{RevokeStakingV1CpiBuilder, UnlockV1CpiBuilder}
};

#[derive(Accounts)]
pub struct UnlockPNFT<'info> {
    #[account(
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_pool: Account<'info, GlobalPool>,

    #[account(
        mut, 
        token::mint = token_mint, 
        token::authority = signer,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,
    pub token_mint: Box<Account<'info, Mint>>,
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
    #[account(mut)]
    pub signer: Signer<'info>,

    //  PDA that stores user's stake info
    #[account(mut)]
    pub user_pool: AccountLoader<'info, UserPool>,

    pub token_program: Program<'info, Token>,
    /// CHECK intstruction will fail if wrong program is supplied
    pub token_metadata_program: AccountInfo<'info>,
    /// CHECK intstruction will fail if wrong program is supplied
    pub auth_rules_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
//    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn unlock_pnft_handler(ctx: Context<UnlockPNFT>) -> Result<()> {

    let mut user_pool = ctx.accounts.user_pool.load_mut()?;

    let seeds = &[
        GLOBAL_AUTHORITY_SEED.as_bytes(), 
        &[ctx.bumps.global_pool]
    ];
    let delegate_seeds = &[&seeds[..]];

    
    // invoke_signed(
    //     &Instruction {
    //         program_id: mpl_token_metadata::ID,
    //         accounts: vec![
    //             // 0. `[signer]` Delegate
    //             AccountMeta::new_readonly(ctx.accounts.global_pool.key(), true),
    //             // 1. `[optional]` Token owner
    //             AccountMeta::new_readonly(ctx.accounts.signer.key(), false),
    //             // 2. `[mut]` Token account
    //             AccountMeta::new(ctx.accounts.token_account.key(), false),
    //             // 3. `[]` Mint account
    //             AccountMeta::new_readonly(ctx.accounts.token_mint.key(), false),
    //             // 4. `[mut]` Metadata account
    //             AccountMeta::new(ctx.accounts.mint_metadata.key(), false),
    //             // 5. `[optional]` Edition account
    //             AccountMeta::new_readonly(ctx.accounts.token_mint_edition.key(), false),
    //             // 6. `[optional, mut]` Token record account
    //             AccountMeta::new(ctx.accounts.token_mint_record.key(), false),
    //             // 7. `[signer, mut]` Payer
    //             AccountMeta::new(ctx.accounts.signer.key(), true),
    //             // 8. `[]` System Program
    //             AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
    //             // 9. `[]` Instructions sysvar account
    //             AccountMeta::new_readonly(ctx.accounts.sysvar_instructions.key(), false),
    //             // 10. `[optional]` SPL Token Program
    //             AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
    //             // 11. `[optional]` Token Authorization Rules program
    //             AccountMeta::new_readonly(ctx.accounts.auth_rules_program.key(), false),
    //             // 12. `[optional]` Token Authorization Rules account
    //             AccountMeta::new_readonly(ctx.accounts.auth_rules.key(), false),
    //         ],
    //         data: UnlockArgs::V1 { authorization_data: None }.try_to_vec().unwrap(),
    //     },
    //     &[
    //         ctx.accounts.global_pool.to_account_info(),
    //         ctx.accounts.signer.to_account_info(),
    //         ctx.accounts.token_account.to_account_info(),
    //         ctx.accounts.token_mint.to_account_info(),
    //         ctx.accounts.mint_metadata.to_account_info(),
    //         ctx.accounts.token_mint_edition.to_account_info(),
    //         ctx.accounts.token_mint_record.to_account_info(),
    //         ctx.accounts.system_program.to_account_info(),
    //         ctx.accounts.sysvar_instructions.to_account_info(),
    //         ctx.accounts.token_program.to_account_info(),
    //         ctx.accounts.auth_rules_program.to_account_info(),
    //         ctx.accounts.auth_rules.to_account_info(),
    //     ],
    //     delegate_seeds,
    // )?;

    UnlockV1CpiBuilder::new(&ctx.accounts.token_metadata_program)
        .authority(&ctx.accounts.global_pool.to_account_info().clone())
        .token_owner(Some(&ctx.accounts.signer))
        .token(&ctx.accounts.token_account.to_account_info())
        .mint(&ctx.accounts.token_mint.to_account_info())
        .metadata(&ctx.accounts.mint_metadata)
        .edition(Some(ctx.accounts.token_mint_edition.as_ref()))
        .token_record(Some(ctx.accounts.token_mint_record.as_ref()))
        .payer(&ctx.accounts.signer)
        .system_program(&ctx.accounts.system_program)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
        .authorization_rules_program(Some(ctx.accounts.auth_rules_program.as_ref()))
        .authorization_rules(Some(ctx.accounts.auth_rules.as_ref()))
        .invoke_signed(delegate_seeds)?;


    // invoke(
    //     &Instruction {
    //         program_id: mpl_token_metadata::ID,
    //         accounts: vec![
    //             // #[account(0, optional, writable, name="delegate_record", desc="Delegate record account")]
    //             AccountMeta::new_readonly(mpl_token_metadata::ID, false),
    //             // #[account(1, name="delegate", desc="Owner of the delegated account")]
    //             AccountMeta::new_readonly(ctx.accounts.user_pool.key(), false),
    //             // #[account(2, writable, name = "metadata", desc = "Metadata account")]
    //             AccountMeta::new(ctx.accounts.mint_metadata.key(), false),
    //             // #[account(3, optional, name = "master_edition", desc = "Master Edition account")]
    //             AccountMeta::new_readonly(ctx.accounts.token_mint_edition.key(), false),
    //             // #[account(4, optional, writable, name = "token_record", desc = "Token record account")]
    //             AccountMeta::new(ctx.accounts.token_mint_record.key(), false),
    //             // #[account(5, name = "mint", desc = "Mint of metadata")]
    //             AccountMeta::new_readonly(ctx.accounts.token_mint.key(), false),
    //             // #[account(6, optional, writable, name = "token", desc = "Token account of mint")]
    //             AccountMeta::new(ctx.accounts.token_account.key(), false),
    //             // #[account(7, signer, name = "authority", desc = "Update authority or token owner")]
    //             AccountMeta::new_readonly(ctx.accounts.signer.key(), true),
    //             // #[account(8, signer, writable, name = "payer", desc = "Payer")]
    //             AccountMeta::new(ctx.accounts.signer.key(), true),
    //             // #[account(9, name = "system_program", desc = "System Program")]
    //             AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
    //             // #[account(10, name = "sysvar_instructions", desc = "Instructions sysvar account")]
    //             AccountMeta::new_readonly(ctx.accounts.sysvar_instructions.key(), false),
    //             // #[account(11, optional, name = "spl_token_program", desc = "SPL Token Program")]
    //             AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
    //             // #[account(12, optional, name = "authorization_rules_program", desc = "Token Authorization Rules Program")]
    //             AccountMeta::new_readonly(ctx.accounts.auth_rules_program.key(), false),
    //             // #[account(13, optional, name = "authorization_rules", desc = "Token Authorization Rules account")]
    //             AccountMeta::new_readonly(ctx.accounts.auth_rules.key(), false),
    //         ],
    //         data: RevokeArgs::StakingV1.try_to_vec().unwrap(),
    //     },
    //     &[
    //         ctx.accounts.global_pool.to_account_info(),
    //         ctx.accounts.mint_metadata.to_account_info(),
    //         ctx.accounts.token_mint_edition.to_account_info(),
    //         ctx.accounts.token_mint_record.to_account_info(),
    //         ctx.accounts.token_mint.to_account_info(),
    //         ctx.accounts.token_account.to_account_info(),
    //         ctx.accounts.signer.to_account_info(),
    //         ctx.accounts.system_program.to_account_info(),
    //         ctx.accounts.sysvar_instructions.to_account_info(),
    //         ctx.accounts.token_program.to_account_info(),
    //         ctx.accounts.auth_rules_program.to_account_info(),
    //         ctx.accounts.auth_rules.to_account_info(),
    //     ],
    // )?;

    RevokeStakingV1CpiBuilder::new(&ctx.accounts.token_metadata_program)
        .delegate(&ctx.accounts.global_pool.to_account_info())
        .metadata(&ctx.accounts.mint_metadata.to_account_info())
        .master_edition(Some(ctx.accounts.token_mint_edition.as_ref()))
        .token_record(Some(ctx.accounts.token_mint_record.as_ref()))
        .mint(&ctx.accounts.token_mint.to_account_info())
        .token(&ctx.accounts.token_account.to_account_info())
        .authority(&ctx.accounts.signer)
        .payer(&ctx.accounts.signer)
        .system_program(&ctx.accounts.system_program)
        .sysvar_instructions(&ctx.accounts.sysvar_instructions)
        .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
        .authorization_rules_program(Some(ctx.accounts.auth_rules_program.as_ref()))
        .authorization_rules(Some(ctx.accounts.auth_rules.as_ref()))
        .invoke()?;

    let timestamp = Clock::get()?.unix_timestamp;

    let reward: u64 = user_pool.remove_nft(
        ctx.accounts.signer.key(), 
        ctx.accounts.token_mint.key(), 
        timestamp)?;
    user_pool.pending_reward += reward;

    Ok(())
}