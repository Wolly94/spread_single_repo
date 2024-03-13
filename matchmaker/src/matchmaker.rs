use std::collections::VecDeque;

use crate::game_finder::{FoundGameResponse, GameFinder};

pub struct Player {
    _token: String,
    sender: kanal::AsyncSender<FoundGameResponse>,
}

#[derive(Clone)]
pub struct Matchmaker {
    sender: kanal::AsyncSender<MessageToMatchmaker>,
    receiver: kanal::AsyncReceiver<MessageToMatchmaker>,
}

pub enum MessageToMatchmaker {
    FindMatch,
    AddPlayer(Player),
}

impl Matchmaker {
    pub fn new() -> Self {
        let (sender, receiver) = kanal::unbounded_async::<MessageToMatchmaker>();
        Matchmaker { sender, receiver }
    }

    pub async fn connect(
        &self,
        token: String,
        player_sender: kanal::AsyncSender<FoundGameResponse>,
    ) {
        match self
            .sender
            .send(MessageToMatchmaker::AddPlayer(Player {
                _token: token,
                sender: player_sender,
            }))
            .await
        {
            Ok(_) => (),
            Err(e) => println!("Failed to add player! {e}"),
        };
    }

    pub async fn find_match(&self) {
        match self.sender.send(MessageToMatchmaker::FindMatch).await {
            Ok(_) => (),
            Err(e) => println!("Failed to find match! {e}"),
        };
    }

    pub async fn run(&self, game_finder: GameFinder) {
        let mut players = VecDeque::new();
        loop {
            match self.receiver.recv().await {
                Ok(msg) => match msg {
                    MessageToMatchmaker::AddPlayer(player) => players.push_back(player),
                    MessageToMatchmaker::FindMatch => {
                        if players.len() >= 2 {
                            let response = game_finder.find_game();
                            let player1 = players.pop_front().expect("at least 2 elements");
                            let player2 = players.pop_front().expect("at least 1 element");
                            player1
                                .sender
                                .send(response.clone())
                                .await
                                .expect("client still here");
                            player2
                                .sender
                                .send(response)
                                .await
                                .expect("client still here");
                        }
                    }
                },
                Err(e) => println!("Failed to receive message for Matchmaker! {e}"),
            }
        }
    }
}
