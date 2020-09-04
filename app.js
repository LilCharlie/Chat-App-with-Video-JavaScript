// Self invoked anonymous function to run applikation correct
(function () {
  // global variables
  let peer = null;
  let conn = null;

  // Connecting to peer server and getting user id (random id if the hash location is not defined)
  const myPeerId = location.hash.slice(1);
  console.log(myPeerId);

  peer = new Peer(myPeerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    config: {
      iceServers: [
        { url: ["stun:eu-turn7.xirsys.com"] },
        {
          username:
            "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
          credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
          url: "turn:eu-turn7.xirsys.com:80?transport=udp",
        },
      ],
    },
  });

  // Handling peer events
  const peerOnOpen = (id) => {
    document.querySelector(".my-peer-id").innerHTML = id;
  };

  const peerOnError = (error) => {
    console.log(error);
  };

  // Handling connection event from remote (from the other user)
  const peerOnConnection = (dataConnection) => {
    conn && conn.close();
    conn = dataConnection;
    console.log(dataConnection);

    // Receiving data from the other user and sending this to "printMessage" function
    conn.on("data", (data) => printMessage(data, "them"));

    // Creating CustomEvent "peer changed" and dispatching this
    const peer = dataConnection.peer;
    const event = new CustomEvent("peer-changed", {
      detail: { peerId: peer },
    });
    document.dispatchEvent(event);
  };

  // Handling peer events
  peer.on("open", peerOnOpen);
  peer.on("error", peerOnError);
  peer.on("connection", peerOnConnection);

  // Connection function
  const connectToPeerClick = (event) => {
    const peerId = event.target.textContent;
    conn && conn.close();
    console.log(peerId);
    conn = peer.connect(peerId);
    console.log(conn);
    conn.on("open", () => {
      console.log("Connection open");
      // Creating CustomEvent "peer changed" and dispatching this
      const event = new CustomEvent("peer-changed", {
        detail: { peerId: peerId },
      });
      document.dispatchEvent(event);

      // Receiving data from the other user and sending this to "printMessage" function
      conn.on("data", (data) => printMessage(data, "them"));
    });
  };

  // Implementing "print message" function
  function printMessage(message, writer) {
    const messagesDiv = document.querySelector(".messages");
    const messageWrapperDiv = document.createElement("div");
    const newMessageDiv = document.createElement("div");
    const messageTimeDiv = document.createElement("div");
    // Getting and setting time (through "new Date" funktion)
    let currentTime = new Date().toLocaleTimeString();
    console.log(currentTime);
    messageTimeDiv.innerHTML = currentTime;
    newMessageDiv.innerText = message;
    messageWrapperDiv.classList.add("message");
    // Checking who send a message and setting class to div
    if (writer === "me") {
      messageWrapperDiv.classList.add("me");
    } else if (writer === "them") {
      messageWrapperDiv.classList.add("them");
    }
    messageWrapperDiv.appendChild(messageTimeDiv);
    messageWrapperDiv.appendChild(newMessageDiv);
    messagesDiv.appendChild(messageWrapperDiv);
  }

  // Setting EventListener for "refresh list" button
  document
    .querySelector(".list-all-peers-button")
    .addEventListener("click", () => {
      const peersEl = document.querySelector(".peers");
      peersEl.firstChild && peersEl.firstChild.remove();
      peer.listAllPeers((peers) => {
        const peerList = document.createElement("ul");
        peers
          .filter((peerId) => peerId !== myPeerId)
          .forEach((peerId) => {
            const peerItem = document.createElement("li");
            const peerButton = document.createElement("button");
            peerButton.innerText = peerId;
            peerButton.classList.add("connect-button");
            peerButton.classList.add(`peerId-${peerId}`);
            peerButton.addEventListener("click", connectToPeerClick);
            peerItem.appendChild(peerButton);
            peerList.appendChild(peerItem);
          });
        document.querySelector(".peers").appendChild(peerList);
      });
    });

  // Setting EventListener for "peer changed"
  document.addEventListener("peer-changed", (event) => {
    // Update connected buttons
    const peerId = event.detail.peerId;
    console.log(event);
    console.log("peerId:", peerId);
    document.querySelectorAll(".connect-button.connected").forEach((el) => {
      el.classList.remove("connected");
    });
    const button = document.querySelector(`.connect-button.peerId-${peerId}`);
    button && button.classList.add("connected");
  });

  // Setting EventListener for "send" button
  document
    .querySelector(".send-new-message-button")
    .addEventListener("click", () => {
      console.log("button clicked");
      let message = document.querySelector(".new-message").value;
      if (message === "") {
        alert("Write a message!");
      } else {
        conn.send(message);
        console.log(message);
        // Printing message in the chat through "printMessage" funktion
        printMessage(message, "me");
        // Reseting input with empty text
        document.querySelector(".new-message").value = "";
      }
    });

  // Setting EventListener for "enter" key
  document.querySelector(".new-message").addEventListener("keyup", (event) => {
    // Number 13 is "enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancelling the default action (if needed)
      event.preventDefault();
      // Triggering "send" button with a click
      document.querySelector(".send-new-message-button").click();
    }
  });
})();
