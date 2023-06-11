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

impl Handler<server::Message> for MyWs {
    type Result = ();

    fn handle(&mut self, msg: server::Message, ctx: &mut Self::Context) -> Self::Result {
        ctx.text(msg.0)
    }
}

impl Actor for MyWs {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        let addr = ctx.address();
        
        self.addr.send(server::Connect {
            acc: self.acc.clone(),
            addr: addr.recipient(),
        })
            .into_actor(self)
            .then(|res, act, ctx| {
            match res {
                Ok(res) => act.id = res,
                _ => ctx.stop(),
            }
            fut::ready(())
        }).wait(ctx);
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        self.addr.do_send(server::Disconnect{
            acc: self.acc.to_string(),
        });
        Running::Stop
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWs {
    fn handle(&mut self, item: Result<ws::Message, ProtocolError>, ctx: &mut Self::Context) {
        match item {
            Ok(ws::Message::Ping(item)) => ctx.pong(&item),
            Ok(ws::Message::Text(text)) => {
                let tx = text.to_string();

                let msg: server::ClientMessage = serde_json::from_str(&tx).unwrap();

                self.addr.do_send(msg)

            }
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            _=>(),
        }
    }
}