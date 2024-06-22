use {
    crate::*, 
    anchor_spl::token::{Mint, Token, TokenAccount},
    mpl_token_metadata::{
        accounts::Metadata, instructions::{DelegateStakingV1CpiBuilder, LockV1CpiBuilder}, 
    }, 
};
use solana_program::pubkey::Pubkey;

#[derive(Accounts)]
pub struct LockPNFT<'info> {
    #[account(
        mut,
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

    token_program: Program<'info, Token>,
    /// CHECK intstruction will fail if wrong program is supplied
    token_metadata_program: AccountInfo<'info>,
    /// CHECK intstruction will fail if wrong program is supplied
    auth_rules_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>
}

pub fn lock_pnft_handler(ctx: Context<LockPNFT>, lock_period: i64) -> Result<()> {

    // Verify metadata is legit
    let nft_metadata = Metadata::safe_deserialize(&mut ctx.accounts.mint_metadata.to_account_info().data.borrow_mut()).unwrap();
    
    // Check if this NFT is the wanted collection and verified
    if let Some(creators) = nft_metadata.creators {
        let mut valid: u8 = 0;
        for creator in creators {
            if creator.address.to_string() == COLLECTION_ADDRESS {
                valid = 1;
                break;
            }
        }
        require!(valid == 1, StakingError::InvalidCollection);
    } else {
        return Err(error!(StakingError::MetadataCreatorParseError));
    };
    // let mut valid: u8 = 0;
    // if let Some(collection) = nft_metadata.collection {
    //     msg!("collection: {}", collection.key.to_string());
    //     if collection.key.to_string() == COLLECTION_ADDRESS {
    //         valid = 1;
    //     }
    // }
    // else {
    //     return Err(error!(StakingError::MetadataCreatorParseError));
    // };
    
    // require!(valid == 1, StakingError::InvalidCollection);
    
    let seeds = &[
        GLOBAL_AUTHORITY_SEED.as_bytes(), 
        &[ctx.bumps.global_pool]
    ];
    let delegate_seeds = &[&seeds[..]];

    // invoke(
    //     &Instruction {
    //         program_id: mpl_token_metadata::ID,
    //         accounts: vec![
    //             // 0. `[writable]` Delegate record account
    //             AccountMeta::new(mpl_token_metadata::ID, false),
    //             // 1. `[]` Delegated owner
    //             AccountMeta::new_readonly(ctx.accounts.user_pool.key(), false),
    //             // 2. `[writable]` Metadata account
    //             AccountMeta::new(ctx.accounts.mint_metadata.key(), false),
    //             // 3. `[optional]` Master Edition account
    //             AccountMeta::new_readonly(ctx.accounts.token_mint_edition.key(), false),
    //             // 4. `[]` Token record
    //             AccountMeta::new_readonly(ctx.accounts.token_mint_record.key(), false),
    //             // 5. `[]` Mint account
    //             AccountMeta::new_readonly(ctx.accounts.token_mint.key(), false),
    //             // 6. `[optional, writable]` Token account
    //             AccountMeta::new(ctx.accounts.token_account.key(), false),
    //             // 7. `[signer]` Approver (update authority or token owner) to approve the delegation
    //             AccountMeta::new_readonly(ctx.accounts.signer.key(), true),
    //             // 8. `[signer, writable]` Payer
    //             AccountMeta::new(ctx.accounts.signer.key(), true),
    //             // 9. `[]` System Program
    //             AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
    //             // 10. `[]` Instructions sysvar account
    //             AccountMeta::new_readonly(ctx.accounts.sysvar_instructions.key(), false),
    //             // 11. `[optional]` SPL Token Program
    //             AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
    //             // 12. `[optional]` Token Authorization Rules program
    //             AccountMeta::new_readonly(ctx.accounts.auth_rules_program.key(), false),
    //             // 13. `[optional]` Token Authorization Rules account
    //             AccountMeta::new_readonly(ctx.accounts.auth_rules.key(), false),
    //         ],
    //         data: DelegateArgs::StakingV1 {
    //             amount: 1,
    //             authorization_data: None,
    //         }
    //         .try_to_vec()
    //         .unwrap(),
    //     },
    //     &[
    //         ctx.accounts.user_pool.to_account_info(),
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
    msg!("!!!");
    DelegateStakingV1CpiBuilder::new(&ctx.accounts.token_metadata_program)
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
        .amount(1)
        // .authorization_data(Some(None))
        .invoke()?;
    msg!("!!!");

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
    //         data: LockArgs::V1 { authorization_data: None }.try_to_vec().unwrap(),
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

    LockV1CpiBuilder::new(&ctx.accounts.token_metadata_program)
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
    msg!("!!!");

    let timestamp = Clock::get()?.unix_timestamp;
    let lock_time = timestamp + DAY * lock_period;
    msg!("lock period: {}", lock_period);

    let global_pool = &mut ctx.accounts.global_pool;
    let reward_per_day = global_pool.reward_per_day;

    let mut _rate: i64 = 0;
    match lock_period {
        ONE => _rate = reward_per_day as i64,
        TWO => _rate = (reward_per_day * 2) as i64,
        THREE => _rate = (reward_per_day * 3) as i64,
        _ => _rate = 0,
    }
    msg!("rate: {}", _rate);

    if global_pool.reward_enable == false {
        _rate = 0;
    }

    let staked_item = StakedNFT {
        nft_addr: ctx.accounts.token_mint.key(),
        stake_time: timestamp,
        reward_time: timestamp,
        lock_time,
        rate: _rate,
    };
    let mut user_pool = ctx.accounts.user_pool.load_mut()?;

    user_pool.add_nft(staked_item);

    Ok(())

}