use std::collections::VecDeque;

use crate::game_finder::{FoundGameResponse, GameFinder};

#[derive(Debug)]
pub struct Player {
    token: String,
    sender: kanal::AsyncSender<FoundGameResponse>,
}

#[derive(Clone)]
pub struct Matchmaker {
    sender: kanal::AsyncSender<MessageToMatchmaker>,
    receiver: kanal::AsyncReceiver<MessageToMatchmaker>,
}

#[derive(Debug)]
pub enum MessageToMatchmaker {
    FindMatch,
    AddPlayer(Player),
    RemovePlayer { token: String },
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
                token,
                sender: player_sender,
            }))
            .await
        {
            Ok(_) => (),
            Err(e) => println!("Failed to add player! {e}"),
        };
    }

    pub async fn remove(&self, token: String) {
        match self
            .sender
            .send(MessageToMatchmaker::RemovePlayer { token })
            .await
        {
            Ok(_) => (),
            Err(e) => println!("Failed to remove player! {e}"),
        };
    }

    pub async fn find_match(&self) {
        match self.sender.send(MessageToMatchmaker::FindMatch).await {
            Ok(_) => (),
            Err(e) => println!("Failed to find match! {e}"),
        };
    }

    pub async fn run(&self, game_finder: GameFinder) {
        let mut players = VecDeque::<Player>::new();
        loop {
            match self.receiver.recv().await {
                Ok(msg) => {
                    println!("Processing message {msg:?}");
                    match msg {
                        MessageToMatchmaker::AddPlayer(player) => {
                            if let Some(ex) = players.iter_mut().find(|p| p.token == player.token) {
                                println!("Found new connection of {}", player.token);
                                ex.sender = player.sender;
                            } else {
                                players.push_back(player);
                                println!("Currently {} players queueing", players.len());
                            }
                        }
                        MessageToMatchmaker::RemovePlayer { token } => {
                            players.retain(|p| p.token != token);
                            println!("Currently {} players queueing", players.len());
                        }
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
                    }
                }
                Err(e) => println!("Failed to receive message for Matchmaker! {e}"),
            }
        }
    }
}
