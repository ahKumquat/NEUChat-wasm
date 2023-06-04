use serde::{Serialize, Deserialize};
use std::collections::HashMap;

use actix::prelude::*;
use actix_web::http::header::Accept;

use crate::entity;
use crate::redis_db;

#[derive(Message)]
#[rtype(result = "()")]
pub struct Message(pub String);

pub struct ChatServer{
    sessions: HashMap<String, Recipient<Message>>,
}

impl ChatServer {
    pub fn new() -> ChatServer {
        ChatServer{
            sessions: HashMap::new(),
        }
    }
}

impl Actor for ChatServer {
    type Context = Context<Self>;
}

#[derive(Message)]
#[rtype(usize)]
pub struct Connect {
    pub acc: String,
    pub addr: Recipient<Message>
}

impl Handler<Connect> for ChatServer {
    type Result = usize;

    fn handle(&mut self, msg: Connect, ctx: &mut Self::Context) -> Self::Result {
        let acc = msg.acc;
        self.sessions.insert(acc,msg.addr);
        0
    }
}

#[derive(Message)]
#[rtype(result="()")]
pub struct Disconnect {
    pub acc: String,
}

impl Handler<Disconnect> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _: &mut Self::Context) -> Self::Result {
       self.sessions.remove(&msg.acc);
    }
}
