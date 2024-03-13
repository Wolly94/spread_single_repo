use axum::{
    extract::{
        ws::{close_code, Message, WebSocket, WebSocketUpgrade},
        Path, State,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use futures::{SinkExt, StreamExt};
use game_finder::GameFinder;
use matchmaker::Matchmaker;

use std::{borrow::Cow, time::Duration};
use std::{net::SocketAddr, path::PathBuf};
use tower_http::services::ServeDir;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

//allows to extract the IP of connecting user
use axum::extract::connect_info::ConnectInfo;
use axum::extract::ws::CloseFrame;

use crate::game_finder::FoundGameResponse;

mod game_finder;
mod matchmaker;

#[tokio::main]
async fn main() {
    let matchmaker = Matchmaker::new();
    let game_finder = GameFinder {};

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "example_websockets=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let assets_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("assets");

    // build our application with some routes
    let app = Router::new()
        .fallback_service(ServeDir::new(assets_dir).append_index_html_on_directories(true))
        .route("/join-queue/:token", get(ws_handler))
        .with_state(matchmaker.clone())
        .with_state(game_finder.clone())
        //// logging so we can see whats going on
        //.layer(
        //    TraceLayer::new_for_http()
        //        .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        //)
        ;

    let mm2 = matchmaker.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(Duration::from_millis(1000)).await;
            mm2.find_match().await;
        }
    });

    tokio::spawn(async move {
        matchmaker.run(game_finder).await;
    });

    // run it with hyper
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8000")
        .await
        .unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    Path(token): Path<String>,
    State(matchmaker): State<Matchmaker>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> impl IntoResponse {
    println!("client with {token} at {addr} connected.");
    ws.on_upgrade(move |socket| handle_socket(socket, token, matchmaker))
}

async fn handle_socket(socket: WebSocket, token: String, matchmaker: Matchmaker) {
    let (sender, receiver) = kanal::unbounded_async::<FoundGameResponse>();

    let (mut s, mut r) = socket.split();

    matchmaker.connect(token.clone(), sender).await;

    // disconnect from queue if websocket connection is closed
    let t2 = token.clone();
    let m2 = matchmaker.clone();
    tokio::spawn(async move {
        loop {
            match r.next().await {
                Some(Ok(Message::Close(f))) => {
                    println!("client {t2} closed connection: {f:?}");
                    m2.remove(t2.clone()).await;
                    break;
                }
                Some(Ok(m)) => println!("ignored client {t2} message: {m:?}"),
                Some(Err(e)) => {
                    println!("failure receiving message from client {t2}: {e}");
                    break;
                }
                None => break,
            }
        }
    });

    match receiver.recv().await {
        Ok(msg) => {
            let json = serde_json::to_string(&msg).expect("serialization should not fail");
            s.send(axum::extract::ws::Message::Text(json))
                .await
                .expect("Client receives message");
            s.send(Message::Close(Some(CloseFrame {
                code: close_code::NORMAL,
                reason: Cow::from("Found Game"),
            })))
            .await
            .expect("client connection can be closed");
        }
        Err(e) => {
            println!("Error while waiting for message from matchmaker! {e}");
        }
    }

    matchmaker.remove(token.clone()).await;
    // returning from the handler closes the websocket connection
    println!("closing connection to {token}");
}
