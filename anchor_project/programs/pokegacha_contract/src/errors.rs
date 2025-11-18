use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Unable to gacha, Insufficient Coins")]
    InsufficientCoins,
    #[msg("Unable to topup, Insufficient funds in wallet")]
    InsufficientFunds,
    #[msg("You are nor permitted to do this action")]
    Unauthorized,
    #[msg("Name is too long")]
    NameTooLong,
}
