const peerOnOpen = (id) => {
  document.querySelector(".my-peer-id").innerHTML = id;
};

const peerOnError = (error) => {
  console.log(error);
};

// Connecting to peer server.
const myPeerId = location.hash.slice(1);
console.log(myPeerId);

let peer = new Peer(myPeerId, {
  host: "glajan.com",
  port: 8443,
  path: "/myapp",
  secure: true,
});

// Handle peer events.
peer.on("open", peerOnOpen);
peer.on("error", peerOnError);

document
  .querySelector(".list-all-peers-button")
  .addEventListener("click", () => {
    peer.listAllPeers((peers) => {
      const peerList = document.createElement("ul");
      peers
        .filter((peerId) => peerId !== myPeerId)
        .map((peerId) => {
          return "*" + peerId + "*";
        })
        .forEach((peerId) => {
          const peerItem = document.createElement("li");
          const peerButton = document.createElement("button");
          peerButton.innerText = peerId;
          peerButton.className = "connect-button";
          peerButton.classList.add(`peerId-${peerId}`);
          peerItem.appendChild(peerButton);
          peerList.appendChild(peerItem);
        });
      document.querySelector(".peers").appendChild(peerList);
    });
  });
