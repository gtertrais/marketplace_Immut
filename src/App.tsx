import './App.css';
import { ImmutableXClient } from '@imtbl/imx-sdk';
import { Link } from '@imtbl/imx-sdk';
import { Magic } from 'magic-sdk';
import { ImmutableMethodResults } from '@imtbl/imx-sdk';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Marketplace from './Marketplace';
import Inventory from './Inventory';
import Bridging from './Bridging';
import Coins from './Coins';
import { Card, ListGroup, ListGroupItem, Row, Col, Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';

require('dotenv').config();

const App = () => {
	// initialise Immutable X Link SDK
	const link = new Link(process.env.REACT_APP_ROPSTEN_LINK_URL)

	// general
	const [tab, setTab] = useState('marketplace');
	const [wallet, setWallet] = useState('undefined');
	const [balance, setBalance] = useState<ImmutableMethodResults.ImmutableGetBalanceResult>(Object);
	const [client, setClient] = useState<ImmutableXClient>(Object);
	const [show, setShow] = useState(false);
	const [address, setAddress]= useState('');


	useEffect(() => {
		buildIMX()
	}, [])

	// initialise an Immutable X Client to interact with apis more easily
	async function buildIMX() {
		const publicApiUrl: string = process.env.REACT_APP_ROPSTEN_ENV_URL ?? '';
		const starkContractAddress: string = process.env.REACT_APP_ROPSTEN_STARK_CONTRACT_ADDRESS ?? '';
		const registrationContractAddress: string = process.env.REACT_APP_ROPSTEN_REGISTRATION_ADDRESS ?? '';
		const magic:any = new Magic('pk_live_EEE47A00FB271E23', {network: 'ropsten',});
		const provider:any = new ethers.providers.Web3Provider(magic.rpcProvider);
		const minterPrivateKey: string = '0x602db0a2557fa0d637255feaad07180e00bea46fe159bda15ae23d014bcf67c9';
		const minter = new ethers.Wallet(ethers.Wallet.createRandom()).connect(provider);
		console.log(publicApiUrl);
		console.log(starkContractAddress);
		console.log(registrationContractAddress);
		
		console.log(minter);
		
		setAddress(minter.address);
		setClient(await ImmutableXClient.build({ publicApiUrl, signer: minter, starkContractAddress: starkContractAddress, registrationContractAddress: registrationContractAddress }))
	}

	// register and/or setup a user
	async function linkSetup(): Promise<void> {
		const ethAddress: string = address;
		
		await client.registerImx({ etherKey: ethAddress, starkPublicKey: client.starkPublicKey });
		
		setWallet(ethAddress.toLowerCase());
		setBalance(await client.getBalance({ user: ethAddress.toLowerCase(), tokenAddress: 'eth' }))
	};

	// logout a user
	async function linkOut(): Promise<void> {
		setWallet('undefined')
	};

	function handleTabs() {
		if (client.address) {
			switch (tab) {
				case 'inventory':
					if (wallet === 'undefined') return <div>Connect wallet</div>
					return <Inventory
						client={client}
						link={link}
						wallet={wallet}
					/>
				case 'bridging':
					if (wallet === 'undefined') return <div>Connect wallet</div>
					return <Bridging
						client={client}
						link={link}
						wallet={wallet}
					/>
				case 'coins':
					return <Coins
						client={client}
						link={link}
						wallet={wallet}
					/>
				default:
					return <Marketplace
						client={client}
						link={link}
					/>
			}
		}
		return null
	}

	const showDropdown = () => {
		setShow(!show);
	}
	const hideDropdown = () => {
		setShow(false);
	}

	return (

		<div className="App">
			<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
				<Container>
					<Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
					<Navbar.Toggle aria-controls="responsive-navbar-nav" />
					<Navbar.Collapse id="responsive-navbar-nav">
						<Nav className="me-auto">
							<Nav.Link onClick={() => setTab('marketplace')}>Marketplace</Nav.Link>
							<NavDropdown
								title="Drops"
								id="collasible-nav-dropdown"
								show={show}
								onMouseEnter={showDropdown}
								onMouseLeave={hideDropdown}>
								<NavDropdown.Item onClick={() => setTab('coins')}>Coins</NavDropdown.Item>
							</NavDropdown>
							
							{wallet !== 'undefined' &&
								<>
									<Nav.Link onClick={() => setTab('bridging')}>Deposit and withdrawal</Nav.Link>
									<Nav.Link onClick={() => setTab('inventory')}>Profile</Nav.Link>
								</>}
						</Nav>
						<Nav className="me-auto">
							{wallet !== 'undefined' &&
								<>
									<Navbar.Text >Active wallet: {wallet.replace(wallet.substring(4, 38), "...")}</Navbar.Text>
									<Navbar.Text style={{ paddingLeft: '40px' }}>ETH balance (in wei): {balance?.balance?.toString()}</Navbar.Text>
								</>}
						</Nav>
						<Nav className="me-auto">
							{wallet === 'undefined' &&
								<Nav.Link onClick={linkSetup}>Setup</Nav.Link>}
							{wallet !== 'undefined' &&
								<Nav.Link onClick={linkOut}>Signout</Nav.Link>}
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<br /><br /><br />
			{handleTabs()}
		</div>
	);
}

export default App;
