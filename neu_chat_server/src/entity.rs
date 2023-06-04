use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct R<T> {
    pub code: u32,
    pub msg: String,
    pub data: T,
}

impl <T> R<T> {
    pub fn new (code: u32, msg: String, data: T) -> Self<>{
        Self {
            code,
            msg,
            data,
        }
    }
}

pub fn ok() -> R<String> {
    R::new(200, String::from("success"), Default::default())
}








#[derive(Serialize, Deserialize)]
pub struct UcAccount {
    pub id: String,
    pub account: String,
    pub username: String,
    pub password: String,
}

impl UcAccount {
    pub fn new() -> Self {
        Self {
            id: Default::default(),
            account: Default::default(),
            username: Default::default(),
            password: Default::default(),
        }
    }
    pub fn build(id: String, account: String, username: String, password: String) -> Self {
        UcAccount {
            id,
            account,
            username,
            password
        }
    }
}