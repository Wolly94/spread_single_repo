use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Clone, Debug)]
pub struct FoundGameResponse {
    id: String,
    url: String,
}

#[derive(Serialize)]
pub struct CreateMatchmakingGameRequest {
    pub tokens: Vec<String>,
}

#[derive(Deserialize)]
pub struct CreatedMatchmakingGameResponse {
    url: String,
}

#[derive(Clone)]
pub struct GameFinder {
    gameserver_api_url: String,
}

#[derive(std::fmt::Debug)]
pub enum FindGameError {
    RequestFailed,
    NoServersAvailable,
    FailedToDeserializeBody,
}

impl GameFinder {
    pub fn new(gameserver_api_url: String) -> Self {
        Self { gameserver_api_url }
    }

    pub async fn find_game(&self, tokens: Vec<String>) -> Result<FoundGameResponse, FindGameError> {
        let client = reqwest::Client::new();
        let request = CreateMatchmakingGameRequest { tokens };
        let res = client
            .post(&(self.gameserver_api_url.clone() + "matchmaking-game"))
            .json(&request)
            .send()
            .await
            .map_err(|_| FindGameError::RequestFailed)?;

        if res.status() == StatusCode::CONFLICT {
            Err(FindGameError::NoServersAvailable)
        } else {
            let resp = res
                .json::<CreatedMatchmakingGameResponse>()
                .await
                .map_err(|e| {
                    println!("Failed to deserialize body: {e}");
                    FindGameError::FailedToDeserializeBody
                })?;

            Ok(FoundGameResponse {
                id: Uuid::new_v4().into(),
                url: resp.url,
            })
        }
    }
}

//#[cfg(test)]
//mod tests {
//    use super::GameFinder;
//
//    #[tokio::test]
//    pub async fn test_find_game() {
//        let gf = GameFinder::new("http://localhost:8081/".into());
//
//        let res = gf.find_game(vec!["123".into(), "234".into()]).await;
//        println!("{res:?}");
//        assert!(res.is_ok());
//    }
//}
//
