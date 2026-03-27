#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub struct MentorshipPlatformContractItem {
    pub owner: Address,
    pub title: String,
    pub notes: String,
    pub state: Symbol,
    pub amount: i128,
    pub updated_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum MentorshipPlatformContractDataKey {
    IdList,
    Item(Symbol),
}

#[contract]
pub struct MentorshipPlatformContract;

#[contractimpl]
impl MentorshipPlatformContract {
    fn ids_key() -> MentorshipPlatformContractDataKey {
        MentorshipPlatformContractDataKey::IdList
    }

    fn item_key(id: &Symbol) -> MentorshipPlatformContractDataKey {
        MentorshipPlatformContractDataKey::Item(id.clone())
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

    pub fn request_item(env: Env, id: Symbol, owner: Address, title: String, notes: String, state: Symbol, amount: i128, updated_at: u64) {
        owner.require_auth();

        let item = MentorshipPlatformContractItem {
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

    pub fn approve_item(env: Env, id: Symbol, state: Symbol, notes: String, updated_at: u64) -> bool {
        let key = Self::item_key(&id);
        let maybe_item: Option<MentorshipPlatformContractItem> = env.storage().instance().get(&key);

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

    pub fn complete_item(env: Env, id: Symbol) -> Option<MentorshipPlatformContractItem> {
        env.storage().instance().get(&Self::item_key(&id))
    }

    pub fn list_ids(env: Env) -> Vec<Symbol> {
        Self::load_ids(&env)
    }
}
