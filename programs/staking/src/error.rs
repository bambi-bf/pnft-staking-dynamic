use crate::*;

#[error_code]
pub enum StakingError {
    #[msg("Admin address dismatch")]
    InvalidAdmin,
    #[msg("Metadata address is invalid")]
    InvalidMetadata,
    #[msg("Collection is invalid")]
    InvalidCollection,
    #[msg("Can not parse creators in metadata")]
    MetadataCreatorParseError,
    #[msg("Insufficient Reward Vault Balance")]
    LackVaultBalance,
    #[msg("NFT Owner key mismatch")]
    InvalidOwner,
    #[msg("No Matching NFT to withdraw")]
    InvalidNFTAddress,
    #[msg("Reward is disabled")]
    DisabledReward,
}
