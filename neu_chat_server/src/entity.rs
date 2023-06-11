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

pub fn ok_token<T>(token: T) -> R<T> {
    R::new(200, String::from("success"), token)
}

pub fn err_msg(msg:String) -> R<String> {
    R::new(500, msg, String::new())
}

#[derive(Serialize, Deserialize)]
pub struct Form {
    pub account: String,
    pub username: String,
    pub password: String,
}

impl Form {
    pub fn new() -> Self {
        Self {
            account: Default::default(),
            username: Default::default(),
            password: Default::default()
        }
    }
}


#[derive(Serialize, Deserialize)]
pub struct UcAccount {
    pub id: String,
    pub account: String,
    pub username: String,
    pub identifier: [u8;32],
    pub r: [u8; 32],
}

impl UcAccount {
    pub fn new() -> Self {
        Self {
            id: Default::default(),
            account: Default::default(),
            username: Default::default(),
            identifier: Default::default(),
            r: Default::default()
        }
    }
    pub fn build(id: String, account: String, username: String, identifier: [u8;32], r:[u8;32]) -> Self {
        UcAccount {
            id,
            account,
            username,
            identifier,
            r
        }
    }
}