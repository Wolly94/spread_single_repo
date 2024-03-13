use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize, Clone)]
pub struct FoundGameResponse {
    id: String,
    url: String,
}

#[derive(Clone)]
pub struct GameFinder {}

impl GameFinder {
    pub fn find_game(&self) -> FoundGameResponse {
        FoundGameResponse {
            id: Uuid::new_v4().into(),
            url: "abc".into(),
        }
    }
}
