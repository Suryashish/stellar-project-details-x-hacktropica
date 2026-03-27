#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub struct PayToMessageContractItem {
    pub owner: Address,
    pub title: String,
    pub notes: String,
    pub state: Symbol,
    pub amount: i128,
    pub updated_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum PayToMessageContractDataKey {
    IdList,
    Item(Symbol),
}

#[contract]
pub struct PayToMessageContract;

#[contractimpl]
impl PayToMessageContract {
    fn ids_key() -> PayToMessageContractDataKey {
        PayToMessageContractDataKey::IdList
    }

    fn item_key(id: &Symbol) -> PayToMessageContractDataKey {
        PayToMessageContractDataKey::Item(id.clone())
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

    pub fn send_item(env: Env, id: Symbol, owner: Address, title: String, notes: String, state: Symbol, amount: i128, updated_at: u64) {
        owner.require_auth();

        let item = PayToMessageContractItem {
            owner,
            title,
            notes,
            state,
            amount,
            updated_at,
        };

        env.storage().instance().set(&Self::item_key(&id), &item);

        let mut ids = Self::load_ids(&env);
        if !Self::has_id(&ids, &id) {
            ids.push_back(id);
            Self::save_ids(&env, &ids);
        }
    }

    pub fn receive_item(env: Env, id: Symbol, state: Symbol, notes: String, updated_at: u64) -> bool {
        let key = Self::item_key(&id);
        let maybe_item: Option<PayToMessageContractItem> = env.storage().instance().get(&key);

        if let Some(mut item) = maybe_item {
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

    pub fn tip_item(env: Env, id: Symbol) -> Option<PayToMessageContractItem> {
        env.storage().instance().get(&Self::item_key(&id))
    }

    pub fn list_ids(env: Env) -> Vec<Symbol> {
        Self::load_ids(&env)
    }
}
