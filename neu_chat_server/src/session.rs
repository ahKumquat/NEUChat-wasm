use actix::Addr;
use crate::server;
use actix::prelude::*;
use actix_web_actors::ws;
use actix_web_actors::ws::ProtocolError;


#[derive(Debug)]
pub struct MyWs{
    pub id: usize,
    pub acc: String,
    pub addr: Addr<server::ChatServer>,
}

impl Actor for MyWs {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWs {
    fn handle(&mut self, item: Result<ws::Message, ProtocolError>, ctx: &mut Self::Context) {
        match item {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(text)) => {
                let tx = text.to_string();


            }
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            _=>(),
        }
    }
}