#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, Address, Env, String,
    Symbol, Vec,
};

#[contracttype]
#[derive(Clone)]
pub struct BookingReservationContractItem {
    pub owner: Address,
    pub title: String,
    pub notes: String,
    pub state: Symbol,
    pub amount: i128,
    pub updated_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum BookingReservationContractDataKey {
    IdList,
    Item(Symbol),
    Count,
}

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum BookingReservationContractError {
    InvalidTitle = 1,
    InvalidTimestamp = 2,
}

#[contract]
pub struct BookingReservationContract;

#[contractimpl]
impl BookingReservationContract {
    fn count_key() -> BookingReservationContractDataKey {
        BookingReservationContractDataKey::Count
    }

    fn ids_key() -> BookingReservationContractDataKey {
        BookingReservationContractDataKey::IdList
    }

    fn item_key(id: &Symbol) -> BookingReservationContractDataKey {
        BookingReservationContractDataKey::Item(id.clone())
    }

    fn validate_item(env: &Env, title: &String, updated_at: u64) {
        if title.len() == 0 {
            panic_with_error!(env, BookingReservationContractError::InvalidTitle);
        }

        if updated_at == 0 {
            panic_with_error!(env, BookingReservationContractError::InvalidTimestamp);
        }
    }

    fn increment_count(env: &Env) {
        let count: u32 = env.storage().instance().get(&Self::count_key()).unwrap_or(0);
        env.storage().instance().set(&Self::count_key(), &(count + 1));
    }

    fn load_ids(env: &Env) -> Vec<Symbol> {
        env.storage().instance().get(&Self::ids_key()).unwrap_or(Vec::new(env))
    }

    fn save_ids(env: &Env, ids: &Vec<Symbol>) {
        env.storage().instance().set(&Self::ids_key(), ids);
    }

    fn has_id(ids: &Vec<Symbol>, id: &Symbol) -> bool {
        for current in ids.iter() {
            if current == id.clone() {
                return true;
            }
        }
        false
    }

    pub fn book_item(env: Env, id: Symbol, owner: Address, title: String, notes: String, state: Symbol, amount: i128, updated_at: u64) {
        owner.require_auth();
        Self::validate_item(&env, &title, updated_at);

        let item = BookingReservationContractItem {
            owner,
            title,
            notes,
            state,
            amount,
            updated_at,
        };

        let key = Self::item_key(&id);
        let exists = env.storage().instance().has(&key);

        env.storage().instance().set(&key, &item);

        let mut ids = Self::load_ids(&env);
        if !Self::has_id(&ids, &id) {
            ids.push_back(id);
            Self::save_ids(&env, &ids);
            if !exists {
                Self::increment_count(&env);
            }
        }
    }

    pub fn confirm_item(env: Env, id: Symbol, state: Symbol, notes: String, updated_at: u64) -> bool {
        let key = Self::item_key(&id);
        let maybe_item: Option<BookingReservationContractItem> = env.storage().instance().get(&key);

        if let Some(mut item) = maybe_item {
            Self::validate_item(&env, &item.title, updated_at);
            item.owner.require_auth();
            item.state = state;
            item.notes = notes;
            item.updated_at = updated_at;
            env.storage().instance().set(&key, &item);
            true
        } else {
            false
        }
    }

    pub fn cancel_item(env: Env, id: Symbol) -> Option<BookingReservationContractItem> {
        env.storage().instance().get(&Self::item_key(&id))
    }

    pub fn list_ids(env: Env) -> Vec<Symbol> {
        Self::load_ids(&env)
    }

    pub fn get_count(env: Env) -> u32 {
        env.storage().instance().get(&Self::count_key()).unwrap_or(0)
    }
}
