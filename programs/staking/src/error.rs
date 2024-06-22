use crate::*;

#[error_code]
pub enum StakingError {
    #[msg("Admin address dismatch")]
    InvalidAdmin,
    #[msg("Max count reached")]
    ExceedMaxCount,
    #[msg("Metadata address is invalid")]
    InvalidMetadata,
    #[msg("Collection is invalid")]
    InvalidCollection,
    #[msg("Can not parse creators in metadata")]
    MetadataCreatorParseError,
    #[msg("Can not find NFT")]
    NftNotExist,
    #[msg("Can not unlock NFT before time")]
    StillLocked,
    #[msg("Insufficient Lamports")]
    LackLamports,
    #[msg("NFT Owner key mismatch")]
    InvalidOwner,
    #[msg("You can't Unstake Before LockTime")]
    BeforeLockTime,
    #[msg("No Matching NFT to withdraw")]
    InvalidNFTAddress,
    #[msg("Reward is disabled")]
    DisabledReward
}