use jsonwebtoken::errors::ErrorKind;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    aud: String,
    exp: usize,
}


pub fn generate_token(account: String) -> String {
    let key = b"magickey";

    let claim = Claims {
        aud: account.to_owned(),
        exp: 99999999999999,
    };

    let token = match encode(
        &Header::default(),
        &claim,
        &EncodingKey::from_secret(key),
    ) {
        Ok(t) => t,
        Err(_) => panic!(),
    };

    token
}

pub fn get_account_by_token(token: &str) -> String {
    let claims = verify(token);
    claims.aud
}

fn verify(token: &str) -> Claims{
    let key = b"magickey";

    let data = match decode::<Claims>(
        token,
        &DecodingKey::from_secret(key),
        &Validation::default(),
    ) {
        Ok(c) => c,
        Err(err) => match *err.kind() {
            ErrorKind::InvalidToken => {panic!("Token is invalid!")}

            ErrorKind::InvalidIssuer => {panic!("Issuer is invalid!")}

            _ => {panic!("Unknown errors {}",err.to_string())}
        }
    };
    data.claims
}