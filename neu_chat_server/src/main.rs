mod redis_db;
mod entity;
mod jwt;
mod session;
mod server;

use actix_web::{Responder, web};
use uuid::Uuid;
use md5;

use entity::ok;

#[actix_web::main]
async fn main() {
    use actix_web::{App, HttpServer};

}

#[post("/app/register")]
async fn register(user: web::Json<UcAccount>) -> Result<impl Responder, E> {
    let uuid = Uuid::new_v4();

    let account: UcAccount = user.0;

    let uc_account : UcAccount = UcAccount {
        id: uuid.to_string(),
        ..account
    };

    //TODO
    let md5_result = md5::compute(uc_account.account);

    let account_str = serde_json::to_string(&uc_account).unwrap();

    redis_db::set(uc_account.account, account_str);

    Ok(web::Json(ok()))
}