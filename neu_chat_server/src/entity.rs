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