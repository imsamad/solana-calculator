use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint, msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// declare and export the program's entrypoint
entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    pub counter: u32,
}

#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, PartialEq)]
pub enum CalculatorInstruction {
    Add { data: u32 },
    Subtract { data: u32 },
}

// program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> entrypoint::ProgramResult {
    // log a message to the blockchain
    msg!("Hello, world!");

    if accounts.is_empty() {
        msg!("Error: No accounts passed to the instruction");
        return Err(ProgramError::NotEnoughAccountKeys);
    }

    let instruction = CalculatorInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    
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
    msg!("before counter is: {}", greeting_accout.counter);

    match instruction {
        CalculatorInstruction::Add { data } => {
            msg!("Adding data");
            greeting_accout.counter += data;
        }
        CalculatorInstruction::Subtract { data } => {
            msg!("Substracting data");
            greeting_accout.counter -= data
        }
    }

    // greeting_accout.counter += 1;
    greeting_accout
        .counter
        .serialize(&mut &mut accout.data.borrow_mut()[..])?;

    msg!("after counter is: {}", greeting_accout.counter);

    // gracefully exit the program
    Ok(())
}
