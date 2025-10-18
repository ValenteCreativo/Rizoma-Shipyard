use anchor_lang::prelude::*;

declare_id!("Hac29kvvQ3vMEu3CzsALtciEwKYULtYuKcifebNFFhrE");

#[program]
pub mod rizoma2 {
    use super::*;
    pub fn store_message(ctx: Context<StoreMessage>, text: String) -> Result<()> {
        let record = &mut ctx.accounts.record;
        record.user = *ctx.accounts.user.key;
        record.text = text;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct StoreMessage<'info> {
    #[account(init, payer = user, space = 8 + 32 + 4 + 280)]
    pub record: Account<'info, Record>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Record {
    pub user: Pubkey,
    pub text: String,
}
