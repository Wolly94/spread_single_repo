use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Clone)]
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
            .post(&self.gameserver_api_url)
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
                .map_err(|_| FindGameError::FailedToDeserializeBody)?;

            Ok(FoundGameResponse {
                id: Uuid::new_v4().into(),
                url: resp.url,
            })
        }
    }
}
