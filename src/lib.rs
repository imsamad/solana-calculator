use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    entrypoint,
    account_info::{next_account_info, AccountInfo},
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// declare and export the program's entrypoint
entrypoint!(process_instruction);

#[derive(BorshSerialize,BorshDeserialize,Debug)]
pub struct GreetingAccount {
    pub counter:u32,
}

// program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8]
) -> entrypoint::ProgramResult {
    // log a message to the blockchain
    msg!("Hello, world!");
    if accounts.is_empty() {
        msg!("Error: No accounts passed to the instruction");
        return Err(ProgramError::NotEnoughAccountKeys);
    }
    let account_iter = &mut accounts.iter();
    
    let accout = next_account_info(account_iter)?;
    
    // Log account public key and other fields
    msg!("Account pubkey: {:?}", accout.key);
    msg!("Account lamports: {:?}", accout.lamports());
    msg!("Account owner: {:?}", accout.owner);
    msg!("Account data length: {:?}", accout.data_len());


    // owner means program who owned or forked this account
    if accout.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut greeting_accout = GreetingAccount::try_from_slice(&accout.data.borrow())?;
    msg!("before counter is: {}",greeting_accout.counter);

    greeting_accout.counter +=1;
    greeting_accout.counter.serialize(&mut &mut accout.data.borrow_mut()[..])?;

         msg!("after counter is: {}",greeting_accout.counter);

    // gracefully exit the program
    Ok(())
}