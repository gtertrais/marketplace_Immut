import { ethers } from 'ethers';
import { ImmutableXClient } from '@imtbl/imx-sdk';
import { Link } from '@imtbl/imx-sdk';
import { ImmutableMethodResults, MintableERC721TokenType } from '@imtbl/imx-sdk';
import Web3 from 'web3';
import { useEffect, useState } from 'react';
import { Card, ListGroup, ListGroupItem, Row, Col, Container, Modal, Button, InputGroup, Form } from 'react-bootstrap';

require('dotenv').config();

interface InventoryProps {
	client: ImmutableXClient,
	link: Link,
	wallet: string
}

const Inventory = ({ client, link, wallet }: InventoryProps) => {
	const [inventory, setInventory] = useState<ImmutableMethodResults.ImmutableGetAssetsResult>(Object);
	// minting
	const [mintTokenId, setMintTokenId] = useState('');
	const [mintBlueprint, setMintBlueprint] = useState('');

	// buying and selling
	const [sellAmount, setSellAmount] = useState('');
	const [sellTokenId, setSellTokenId] = useState('');
	const [sellTokenAddress, setSellTokenAddress] = useState('');
	const [sellCancelOrder, setSellCancelOrder] = useState('');
	const [showSell, setShowSell] = useState(false);
	const [showCancel, setShowCancel] = useState(false);



	useEffect(() => {
		load()
	}, [])

	async function load(): Promise<void> {
		setInventory(await client.getAssets({ user: wallet, sell_orders: true }))
	};

	// sell an asset
	async function sellNFT() {
		await link.sell({
			amount: sellAmount,
			tokenId: sellTokenId,
			tokenAddress: sellTokenAddress
		})
		setInventory(await client.getAssets({ user: wallet, sell_orders: true }))
	};

	// cancel sell order
	async function cancelSell() {
		await link.cancel({
			orderId: sellCancelOrder
		})
		setInventory(await client.getAssets({ user: wallet, sell_orders: true }))
	};

	// helper function to generate random ids
	function random()
		: number {
		const min = 1;
		const max = 1000000000;
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// the minting function should be on your backend
	async function mint() {
		// initialise a client with the minter for your NFT smart contract
		const provider = new ethers.providers.JsonRpcProvider(`https://eth-ropsten.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`);
		const minterPrivateKey: string = process.env.REACT_APP_MINTER_PK ?? ''; // registered minter for your contract
		const minter = new ethers.Wallet(minterPrivateKey).connect(provider);
		const publicApiUrl: string = process.env.REACT_APP_ROPSTEN_ENV_URL ?? '';
		const starkContractAddress: string = process.env.REACT_APP_ROPSTEN_STARK_CONTRACT_ADDRESS ?? '';
		const registrationContractAddress: string = process.env.REACT_APP_ROPSTEN_REGISTRATION_ADDRESS ?? '';
		const minterClient = await ImmutableXClient.build({
			publicApiUrl,
			signer: minter,
			starkContractAddress,
			registrationContractAddress,
		})

		// mint any number of NFTs to specified wallet address (must be registered on Immutable X first)
		const token_address: string = process.env.REACT_APP_TOKEN_ADDRESS ?? ''; // contract registered by Immutable
		const result = await minterClient.mint({
			mints: [{
				etherKey: wallet,
				tokens: [{
					type: MintableERC721TokenType.MINTABLE_ERC721,
					data: {
						id: mintTokenId, // this is the ERC721 token id
						blueprint: mintBlueprint, // this is passed to your smart contract at time of withdrawal from L2
						tokenAddress: token_address.toLowerCase(),
					}
				}],
				nonce: random().toString(10),
				authSignature: ''
			}]
		});
		console.log(`Token minted: ${result.results[0].token_id}`);
		setInventory(await client.getAssets({ user: wallet, sell_orders: true }))
	};

	const handleCloseSell = () => { setShowSell(false); }
	const handleCloseCancel = () => { setShowCancel(false); }

	const handleShowSell = (item: any) => {
		setShowSell(true)
		setSellTokenId(item.token_id)
		setSellTokenAddress(item.token_address)
	}

	const handleCancelSell = (item: any) => {
		setShowCancel(true)
		console.log(item);

		setSellCancelOrder(item.orders.sell_orders[0].order_id)
	}

	const handleAmountChange = (value: any) => {
		setSellAmount(value);
	}

	const handleConfirmCancel = () => {
		handleCloseCancel()
		cancelSell()
	}

	async function handleSell() {
		handleCloseSell()
		sellNFT()
	}

	const getPrice = (item: any) => {
		let price = parseInt(item.orders.sell_orders[0].buy_quantity._hex)/1e18;
		return price
	}

	return (
		<div>
			<div>
				<Container>
					<Row xs={1} md={3} lg={3} className="g-4">
						{inventory.result !== null && inventory.result !== undefined && inventory.result.map((item: any) => {
							return (
								<>
									<Col>
										<Card style={{ width: '18rem' }}>
											<Card.Img variant="top" style={{ width: '100%', height: '15vw', objectFit: 'cover' }} src={item.collection.icon_url} />
											<Card.Body>
												<Card.Title>Card Title</Card.Title>
												<Card.Text>
													{item.collection.name}
												</Card.Text>
											</Card.Body>
											<ListGroup className="list-group-flush">
												<ListGroupItem>{item.token_id}</ListGroupItem>
												{Object.keys(item.orders).length !== 0 &&
													<ListGroupItem>{'Price: ' + getPrice(item) + ' ETH'}</ListGroupItem>}
											</ListGroup>
											<Card.Body>
												{Object.keys(item.orders).length === 0 &&
													<Card.Link onClick={() => handleShowSell(item)}>Sell</Card.Link>}
												{Object.keys(item.orders).length !== 0 &&
													<Card.Link onClick={() => handleCancelSell(item)}>Cancel Sell</Card.Link>}
											</Card.Body>
										</Card>
									</Col>
									<Modal show={showSell} onHide={handleCloseSell}>
										<Modal.Header closeButton>
											<Modal.Title>Modal heading</Modal.Title>
										</Modal.Header>
										<InputGroup hasValidation>
											<InputGroup.Text>ETH</InputGroup.Text>
											<Form.Control onChange={e => handleAmountChange(e.target.value)} type="number" required isInvalid />
											<Form.Control.Feedback type="invalid">
												Please choose a price in ETH.
											</Form.Control.Feedback>
										</InputGroup>
										<Modal.Footer>
											<Button variant="secondary" onClick={handleCloseSell}>
												Close
											</Button>
											<Button variant="primary" onClick={handleSell}>
												Save Changes
											</Button>
										</Modal.Footer>
									</Modal>
									<Modal show={showCancel} onHide={handleCloseCancel}>
										<Modal.Header closeButton>
											<Modal.Title>Are you Sure ?</Modal.Title>
										</Modal.Header>
										<Modal.Footer>
											<Button variant="secondary" onClick={handleCloseCancel}>
												No
											</Button>
											<Button variant="primary" onClick={handleConfirmCancel}>
												Yes
											</Button>
										</Modal.Footer>
									</Modal>
								</>)
						}
						)}
					</Row>
				</Container>
			</div>
		</div>
	);
}

export default Inventory;
