let state = {
  id: "",
  messages: [],
  participants: [],
  socket: {},
};

function handleUserLogin(e) {
  e.preventDefault();
  const nickname = e.target.elements.nickname.value;
  const socket = io("http://localhost:3000");
  state.socket = socket;
  socket.emit("nicknameMegadva", { nickname: nickname });
  socket.on("userListaMegvaltozott", (payload) => {
    state.participants = payload;
    renderChatComponent();
  });

  socket.on("bejelentkezesSikeres", (payload) => {
    state.id = payload.id;
    state.messages = payload.messages;
    state.participants = payload.participants;
    renderChatComponent();
  });
  
  state.socket.on("uzenetekMegvaltoztak", (payload) => {
    state.messages = payload.messages;
    renderChatComponent();
  });
}

function handleMessageSubmit(e) {
  e.preventDefault();
  state.socket.emit("ujUzenet", {
    message: e.target.elements.message.value,
  });
  e.target.reset();
}

function renderChatComponent() {
  document.getElementById("app-container").innerHTML = `
      <h4 class="p-3">Jelenlévők: ${state.participants.join(", ")}
      <div class="messaging">
        <div class="inbox_msg">
          <div class="mesgs">
            <div class="msg_history" id="messages">
            ${state.messages
              .map((msg) => (msg.id === state.id ? renderSentMessage(msg) : renderReceivedMessage(msg)))
              .join("")}
            </div>
            <div class="type_msg">
              <div class="input_msg_write">
                <form id="message" onsubmit="handleMessageSubmit(window.event)">
                  <input type="text" name="message" class="write_msg" placeholder="Írjon be üzenetet..." />
                  <button class="msg_send_btn" type="button">
                    Küldés
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  document.getElementById("messages").scrollTo(0, document.getElementById("messages").scrollHeight);
}

function renderSentMessage(message) {
  return `<div class="outgoing_msg">
      <div class="sent_msg">
      <b>${message.nickname}:</b>
      <p>${message.content}</p>
        <span class="time_date">  ${new Date(message.timestamp).toLocaleTimeString("hu-HU")}</span>
      </div>
    </div>`;
}

function renderReceivedMessage(message) {
  return `<div class="incoming_msg">
        <div class="received_msg">
          <div class="received_withd_msg">
            <b>${message.nickname}:</b>
            <p>${message.content}</p>
            <span class="time_date">  ${new Date(message.timestamp).toLocaleTimeString("hu-HU")}</span>
          </div>
        </div>
      </div>`;
}


function renderLoginComponent() {
  document.getElementById("app-container").innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col-6 offset-3">
            <h3 class="text-center mb-5 p-3"></h3>
            <form id="login" onsubmit="handleUserLogin(window.event)">
              <input type="text" name="nickname" class="form-control mb-3" placeholder="Név" />
              <button class="btn btn-primary float-right" type="submit">
                Bejelentkezés
              </button>
            </form>
          </div>
        </div>
      </div>
  `;
}

window.onload = renderLoginComponent;
