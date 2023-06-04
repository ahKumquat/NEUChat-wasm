mod redis_db;
mod entity;
mod jwt;
mod session;
mod server;

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
use actix_web_actors::ws;
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use entity::{ok, UcAccount};
use magic_crypt::{MagicCryptTrait, new_magic_crypt};
use unicode_segmentation::UnicodeSegmentation;
use crate::server::Message;

#[actix_web::main]
async fn main() -> std::io::Result<()>{
    use actix_web::{App, HttpServer};

    let server = server::ChatServer::new().start();

    HttpServer::new(move|| {
        App::new()
            .app_data(web::Data::new(server.clone()))
            .route("/chat/{account}",web::get().to(chat_route))
            .service(register)
    })
        .bind(("127.0.0.1", 1420))?
        .run()
        .await
}

#[post("/app/register")]
async fn register(user: web::Json<UcAccount>) -> Result<impl Responder> {
    let uuid = Uuid::new_v4();

    let mut account: UcAccount = user.0;

    let str = account.password.graphemes(true).rev().collect::<String>();

    let mc = new_magic_crypt!(str,256);

    account.password = mc.encrypt_str_to_base64(&account.password);

    let uc_account : UcAccount = UcAccount {
        id: uuid.to_string(),
        ..account
    };

    let account_str = serde_json::to_string(&uc_account).unwrap();

    redis_db::set(uc_account.account, account_str);

    Ok(web::Json(ok()))
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

#[derive(Debug,Serialize, Deserialize)]
struct Mes {
    msg: String,
}


