mod redis_db;
mod entity;
mod jwt;
mod session;
mod server;

use std::any::type_name;
use std::hash::Hash;
use std::num::NonZeroU32;
use actix::prelude::*;
use actix_web::{Responder,
                http::header::ContentType,
                web::{self},
                post,
                get,
                Result,
                HttpRequest,
                HttpResponse,
                Error};
use actix_web::body::MessageBody;
use actix_web_actors::ws;
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use entity::{ok, ok_token, err_msg, UcAccount, Form};
use magic_crypt::{MagicCryptTrait, new_magic_crypt};
use unicode_segmentation::UnicodeSegmentation;
use ring::{digest, pbkdf2, rand};
use ring::rand::SecureRandom;
use jwt::{generate_token, get_account_by_token};
use crate::server::Message;

#[actix_web::main]
async fn main() -> std::io::Result<()>{
    use actix_web::{App, HttpServer};

    let server = server::ChatServer::new().start();

    HttpServer::new(move|| {
        App::new()
            .app_data(web::Data::new(server.clone()))
            .route("/chat/{account}",web::get().to(chat_route))
            .route("/game/{account}",web::get().to(game_route) )
            .service(register)
            .service(login)
            .service(get_info)
            .service(get_users)
            .service(hello)
    })
        .bind(("0.0.0.0", 1420))?
        .run()
        .await
}

#[post("/app/register")]
async fn register(user: web::Json<Form>) -> Result<impl Responder> {
    let uuid = Uuid::new_v4();

    let mut account: Form = user.0;

    const LEN: usize = digest::SHA256_OUTPUT_LEN;

    let n_tier = NonZeroU32::new(100_000).unwrap();

    let rng = rand::SystemRandom::new();
    
    let mut salt = [0u8; LEN];
    let mut hash = [0u8; LEN];

    rng.fill(&mut salt).expect("cannot fill salt");
    
    pbkdf2::derive(
        pbkdf2::PBKDF2_HMAC_SHA256,
        n_tier,
        &salt,
        account.password.as_bytes(),
        &mut hash
    );

    let uc_account : UcAccount = UcAccount {
        id: uuid.to_string(),
        account: account.account,
        username: account.username,
        identifier: hash,
        r: salt
    };

    let account_str = serde_json::to_string(&uc_account).unwrap();

    redis_db::set(uc_account.account.clone(), account_str);

    let token = jwt::generate_token(uc_account.account);

    Ok(web::Json(ok_token(token)))
}

#[post("/app/login")]
async fn login(user: web::Json<Form>) -> Result<impl Responder> {
    let account = user.0;
    let res = redis_db::get(account.account.to_string());

    if !res.is_ok(){
        return Ok(web::Json(err_msg(String::from("Wrong Account or Password!"))));
    }

    let uc_account: UcAccount = serde_json::from_str(&*res.unwrap()).unwrap();

    let n_tier = NonZeroU32::new(100_000).unwrap();

    let is_ok = pbkdf2::verify(
        pbkdf2::PBKDF2_HMAC_SHA256,
        n_tier,
        &uc_account.r,
        account.password.as_bytes(),
        &uc_account.identifier,
    );

    if !is_ok.is_ok() {
        return Ok(web::Json(err_msg(String::from("Wrong Account or Password!"))));
    }

    let token = jwt::generate_token(account.account);

    Ok(web::Json(ok_token(token)))
}

#[get("/app/getUserInfo")]
async fn get_info(req: HttpRequest) -> HttpResponse {
    let header = req.headers();

    let token = header.get("token").unwrap();

    let acc = get_account_by_token(token.to_str().unwrap());

    let res = redis_db::get(acc);

    if !res.is_ok() {
        let msg = err_msg(String::from("No such account"));
        let str = serde_json::to_string(&msg).unwrap();
        return HttpResponse::Ok().body(str);
    }

    let acc_str = res.unwrap();

    let uc_acc: UcAccount = serde_json::from_str(acc_str.as_str()).unwrap();

    let data = ok_token(uc_acc.account);

    let res_str = serde_json::to_string(&data).unwrap();

    HttpResponse::Ok().content_type(ContentType::json()).body(res_str)

}


#[get("/app/getUserList")]
async fn get_users() -> HttpResponse{
    let res = redis_db::get_keys();
    let r = res.unwrap();
    let data = ok_token(r);
    let res_str = serde_json::to_string(&data).unwrap();
    HttpResponse::Ok().content_type(ContentType::json()).body(res_str)
}

async fn chat_route(
    request: HttpRequest,
    stream: web::Payload,
    server: web::Data<Addr<server::ChatServer>>,
) -> Result<HttpResponse, Error>{
    let path = request.path();

    let acc = &path[6..path.len()];

    let resp = ws::start(
        session::MyWs{
            id:0,
            acc: acc.to_string(),
            addr: server.get_ref().clone(),
        },
        &request,
        stream,
    )?;

    Ok(resp)
}

async fn game_route(
    request: HttpRequest,
    stream: web::Payload,
    server: web::Data<Addr<server::ChatServer>>,
) -> Result<HttpResponse, Error>{
    let path = request.path();

    let acc = &path[6..path.len()];

    let resp = ws::start(
        session::MyWs{
            id:0,
            acc: acc.to_string(),
            addr: server.get_ref().clone(),
        },
        &request,
        stream,
    )?;

    Ok(resp)
}


#[get("/hello")]
async fn hello() -> impl Responder {
    "Hello"
}

#[derive(Debug,Serialize, Deserialize)]
struct Mes {
    msg: String,
}


