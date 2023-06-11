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

#[derive(Serialize, Deserialize)]
struct ResultData {
    msg_type: String,
    user_list: Vec<entity::UcAccount>
}

impl ChatServer {
    pub fn new() -> ChatServer {
        ChatServer{
            sessions: HashMap::new(),
        }
    }

    fn send_message(&self, msg_type: String, receiver: String, message: String) {
        match msg_type.as_str() {
            "doge" => {
                println!("doge");
            }
            "user-list" => {
                let mut user_list: Vec<entity::UcAccount> = Vec::new();

                for (k, _) in &self.sessions {
                    let json = redis_db::get(k.to_string()).unwrap();
                    let acc = serde_json::from_str(&json).unwrap();
                    user_list.push(acc);
                }

                let client_message = ResultData {
                    msg_type,
                    user_list,
                };

                let res = serde_json::to_string(&client_message).unwrap();

                for (k,_) in &self.sessions {
                    if let Some(addr) = self.sessions.get(k.as_str()) {
                        addr.do_send(Message(res.to_string()));
                    }
                }
            }
            _ => {
                if let Some(addr) = self.sessions.get(&receiver) {
                    addr.do_send(Message(message));
                }
            }
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
        self.send_message(String::from("user-list"), String::new(), String::new());
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
        self.send_message(String::from("user-list"), String::new(), String::new());
    }
}

#[derive(Message)]
#[rtype(result = "()")]
#[derive(Debug, Serialize, Deserialize)]
pub struct ClientMessage {
    pub msg_type: String,
    pub receiver: String,
    pub sender: String,
    pub msg: String,
    pub sender_avatar: String,
}

impl Handler<ClientMessage> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: ClientMessage, _: &mut Self::Context) -> Self::Result {
        let msg_type = msg.msg_type.clone();
        match msg_type.as_str() {
            "doge" => {
                println!("doge")
            }
            _ => {
                let receiver = msg.receiver.clone();
                let msg_type = msg.msg_type.clone();
                let json = serde_json::to_string(&msg).unwrap();
                self.send_message(msg_type, receiver, json);
            }
        }
    }
}
