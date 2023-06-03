use redis::Commands;

const URL: &str = "redis://:your_password@localhost:6379/";

pub fn set(key: String, value: String) {
    let client = redis::Client::open(URL).unwrap();
    let mut conn = client.get_connection().unwrap();
    let _:() = con.set(key, value).unwrap();
}

pub fn get(key: String) -> redis::RedisResult<String> {
    let client = redis::Client::open(URL).unwrap();
    let mut conn = client.get_connection().unwrap();
    conn.get(key)
}