mod pwd;

use redis::Commands;
use pwd::PWD;

//"redis://:YOUR_PASSWORD@localhost:6379/";
const YOUR_PASSWORD: &str = PWD;

const URL: &str = YOUR_PASSWORD;

pub fn set(key: String, value: String) {
    let client = redis::Client::open(URL).unwrap();
    let mut conn = client.get_connection().unwrap();
    let _:() = conn.set(key, value).unwrap();
}

pub fn get(key: String) -> redis::RedisResult<String> {
    let client = redis::Client::open(URL).unwrap();
    let mut conn = client.get_connection().unwrap();
    conn.get(key)
}