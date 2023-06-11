mod pwd;

use redis::{Commands, Connection, ConnectionLike};
use uuid::Bytes;
use pwd::PWD;

//"redis://:YOUR_PASSWORD@localhost:6379/";
const YOUR_PASSWORD: &str = PWD;

const URL: &str = YOUR_PASSWORD;

fn init() -> Connection {
    let client = redis::Client::open(URL).unwrap();
    let mut conn = client.get_connection().unwrap();
    conn
}

pub fn set(key: String, value: String) {
    let mut conn = init();
    let _:() = conn.set(key, value).unwrap();
}

pub fn get(key: String) -> redis::RedisResult<String> {
    let mut conn = init();
    conn.get(key)
}

pub fn get_keys() -> redis::RedisResult<Vec<String>>{
    let mut conn = init();
    conn.keys("*")
}
