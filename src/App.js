import logo from './logo.svg';
import './App.css';
import { HashConnect } from "hashconnect";

let saveData = {
  topic: "",
  pairingString: "",
  privateKey: "",
  pairedWalletData: null,
  pairedAccounts: [],
};

let appMetadata = {
  name: "RAFA",
  description: "RAFA platform built on the Hedera Hashgraph",
  icon: "https://www.hashpack.app/img/logo.svg",
};

const loadLocalData = () => {
  let foundData = localStorage.getItem("walletMetadata");

  if (foundData) {
    saveData = JSON.parse(foundData);
    return true;
  } else return false;
};

function App() {
  async function connectToHashPack() {
    //create the hashconnect instance
    let hashconnect = new HashConnect();

    hashconnect.foundExtensionEvent.once(extensionMetadata => {
      hashconnect.connectToLocalWallet(
        saveData.pairingString,
        extensionMetadata
      );
    });

    hashconnect.pairingEvent.once(pairingData => {
      saveData.pairedWalletData = pairingData.metadata;
      pairingData.accountIds.forEach(id => {
        if (saveData.pairedAccounts.indexOf(id) === -1)
          saveData.pairedAccounts.push(id);
      });
      localStorage.setItem("walletMetadata", JSON.stringify(saveData));
      let provider = hashconnect.getProvider(
        "testnet",
        saveData.topic,
        saveData.pairedAccounts[0]
      );
      let signer = hashconnect.getSigner(provider);
      console.log("hashpack signer1 ===> ", signer);
    });

    if (!loadLocalData()) {
      //first init and store the private for later
      let initData = await hashconnect.init(appMetadata);
      saveData.privateKey = initData.privKey;

      //then connect, storing the new topic for later
      const state = await hashconnect.connect();
      saveData.topic = state.topic;

      //generate a pairing string, which you can display and generate a QR code from
      saveData.pairingString = hashconnect.generatePairingString(
        state,
        "testnet",
        false
      );

      //find any supported local wallets
      hashconnect.findLocalWallets();
    } else {
      //use loaded data for initialization + connection
      await hashconnect.init(appMetadata, saveData.privateKey);
      await hashconnect.connect(saveData.topic, saveData.pairedWalletData);
      let provider = hashconnect.getProvider(
        "testnet",
        saveData.topic,
        saveData.pairedAccounts[0]
      );
      let signer = hashconnect.getSigner(provider);
      console.log("hashpack signer2 ===> ", signer)
    }
  }

  return (
    <div className="App">
      <button
        type="button"
        onClick={connectToHashPack}
        className="connect-button"
      >
        <img src="hashpack-icon.png" loading="lazy" height="16" alt="HashPack logo" />
        Connect
      </button>
      <header className="App-header">
        <p>
          THIS IS A TEST PROJECT FOR RAFA
        </p>
      </header>
    </div>
  );
}

export default App;
