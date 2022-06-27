import React from "react";
import axios from "axios";
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";
import MyNFTArtifact from "./contracts/MyNFT.json";
import MyNFTAddress from "./contracts/MyNFT-address.json";
import {
  Navbar,
  Container,
  Row,
  Col,
  Nav,
  Button,
  Card,
  Modal,
  Form,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

const NETWORK_ID: string = "31337";
interface AppState {
  provider: ethers.providers.Web3Provider | undefined;
  contract: ethers.Contract | undefined;
  signer: ethers.Signer | undefined;
  userEthBalance: ethers.BigNumber;
  tokens: Array<string[]>;
  symbol: string | undefined;
  name: string | undefined;
  signerAddress: string | undefined;
  showMintModal: boolean;
  mintFormURI: string | undefined;
  mintFormDescription: string | undefined;
}

interface TokenMetadata {
  name: string;
  description: string;
  image: string;
}

class App extends React.Component<{}, AppState> {
  state: AppState = {
    provider: undefined,
    contract: undefined,
    signer: undefined,
    userEthBalance: ethers.BigNumber.from(0),
    tokens: new Array<string[]>(),
    symbol: undefined,
    name: undefined,
    signerAddress: undefined,
    showMintModal: false,
    mintFormURI: "",
    mintFormDescription: "",
  };
  _interval: any = undefined;

  constructor(props: {}) {
    super(props);
    this._interval = undefined;
  }

  async connectWallet() {
    const ethereum = (window as any).ethereum;
    await ethereum.request({ method: "eth_requestAccounts" });
    if (ethereum.networkVersion !== NETWORK_ID) {
      alert("ネットワークが異なります");
      return;
    }
    ethereum.on("accountsChanged", () => {
      alert("アカウントが切り替わりました。ページを再読み込みしてください。");
    });
    this._setup();
  }

  async _setup() {
    const ethereum = (window as any).ethereum;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner(0);
    const contract = new ethers.Contract(
      MyNFTAddress.address as string,
      MyNFTArtifact.abi as any,
      signer
    );
    const signerAddress = await signer.getAddress();
    this.setState({ provider, contract, signer, signerAddress }, () => {
      this._interval = setInterval(() => this._updateBalance(), 1000);
      this._updateBalance();
      this._fetchTokens();
    });
  }

  async _updateBalance() {
    const eth_balance = await this.state.provider?.getBalance(
      this.state.signerAddress!!
    );
    this.setState({ userEthBalance: eth_balance || ethers.BigNumber.from(0) });
  }

  async _fetchTokens() {
    const totalSupply = await this.state.contract?.totalSupply();
    for (let i = 1; i <= totalSupply.toNumber(); i++) {
      const tokenURI = await this.state.contract?.tokenURI(i);
      const tokenOwner = await this.state.contract?.ownerOf(i);
      const { data } = await axios.get<TokenMetadata>(tokenURI);
      if (data) {
        this.state.tokens[i - 1] = [
          data.name,
          data.description,
          data.image,
          tokenOwner,
        ];
      } else {
        alert("Metadataの読み込みに失敗しました");
      }
    }
  }

  async _mint(_tokenURI: string) {
    try {
      const tx = await this.state.contract?.mintTo(
        this.state.signerAddress,
        _tokenURI
      );
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("トランザクションに失敗しました");
      }
      alert("NFTを発行しました");
    } catch (error: any) {
      alert("エラー:" + error.message);
    }
  }

  handleMint(event: any) {
    event.preventDefault();
    const _mintFormURI = this.state.mintFormURI;
    if (_mintFormURI) {
      this._mint(_mintFormURI)
        .then(() => this._fetchTokens())
        .then(() => this.setState({ showMintModal: false }));
    }
  }
  openMintedModal() {
    this.setState({
      mintFormURI: "",
      mintFormDescription: "",
      showMintModal: true,
    });
  }

  render() {
    if (!window.ethereum) {
      return <h2>Metamaskがインストールされていません。</h2>;
    }
    // Metamaskがインストールできていた時の処理
    return (
      <div>
        <section id="navbar">
          {/* ウォレットの接続ボタンなどを備えたNavbarを設置します。*/}
          <Navbar bg="light" expand="lg">
            <Container>
              <Navbar.Brand>MyNFT Gallary</Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse className="justify-content-end">
                {this.state.signer && (
                  <div>
                    <Navbar.Text className="d-flex p-2">
                      接続中: <code>{this.state.signerAddress}</code>
                    </Navbar.Text>
                    <Navbar.Text className="d-flex p-2">
                      残高:{" "}
                      <code>
                        {ethers.utils.formatUnits(
                          this.state.userEthBalance.toString(),
                          "ether"
                        ) + "ETH"}
                      </code>
                    </Navbar.Text>
                  </div>
                )}
                {!this.state.signer && (
                  <Nav>
                    <Button
                      variant="btn btn-success"
                      onClick={() => this.connectWallet()}
                    >
                      お財布につなぐ
                    </Button>
                  </Nav>
                )}
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </section>
        <section id="header">
          {/* NFTを発行するButtonを配置します。*/}
          <Container>
            {this.state.signer && (
              <Card className="m-3">
                <Card.Body className="text-center">
                  <Button
                    variant="primary"
                    onClick={() => this.openMintedModal()}
                  >
                    NFTを発行
                  </Button>
                </Card.Body>
              </Card>
            )}
            <Modal
              show={this.state.showMintModal}
              size="lg"
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                  NFTを発行
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {/* Formを配置します。 */}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Metadata URI path</Form.Label>
                    <Form.Control
                      placeholder="Metadata URI Path"
                      onChange={(e: any) => {
                        this.setState({ mintFormURI: e.target.value });
                      }}
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  onClick={() => this.setState({ showMintModal: false })}
                  className="btn btn-light"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={(e) => {
                    this.handleMint(e);
                  }}
                >
                  発行(MINT)
                </Button>
              </Modal.Footer>
            </Modal>
          </Container>
        </section>
        <section id="tokens">
          {/* 発行されたNFT一覧を表示するCardを配置します */}
          <Container>
            <Row md={3}>
              {this.state.tokens.map((tokenMetadata, index) => (
                <Col key={index}>
                  <Card className="m-3">
                    <Card.Img variant="top" src={tokenMetadata[2]} />
                    <Card.Body>
                      <Card.Title>
                        #{index + 1} {tokenMetadata[0]}
                      </Card.Title>
                      <Card.Text>
                        Owner: <code>{tokenMetadata[3]}</code>
                      </Card.Text>
                      <Card.Text>{tokenMetadata[1]}</Card.Text>
                      {tokenMetadata[3] === this.state.signerAddress && (
                        <Button variant="primary">Transfar</Button>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      </div>
    );
  }
}

export default App;
