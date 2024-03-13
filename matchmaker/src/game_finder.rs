use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct FoundGameResponse {
    url: String,
}

#[derive(Clone)]
pub struct GameFinder {}

impl GameFinder {
    pub fn find_game(&self) -> FoundGameResponse {
        FoundGameResponse { url: "abc".into() }
    }
}
