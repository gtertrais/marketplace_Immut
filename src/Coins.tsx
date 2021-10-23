import { ethers } from 'ethers';
import { ImmutableXClient } from '@imtbl/imx-sdk';
import { Link } from '@imtbl/imx-sdk';
import { MintableERC721TokenType } from '@imtbl/imx-sdk';
import { useState } from 'react';
import { Card, ListGroup, ListGroupItem, Row, Col, Container } from 'react-bootstrap';

require('dotenv').config();

interface CoinsProps {
	client: ImmutableXClient,
	link: Link,
	wallet: string
}

const Coins = ({ client, link, wallet }: CoinsProps) => {
	// minting
	const [mintTokenId, setMintTokenId] = useState('');
	const [mintBlueprint, setMintBlueprint] = useState('');


	// helper function to generate random ids
	function random()
		: number {
		const min = 1;
		const max = 1000;
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// the minting function should be on your backend
	async function mint() {
		// initialise a client with the minter for your NFT smart contract
		const provider = new ethers.providers.JsonRpcProvider(`https://eth-ropsten.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`);
		console.log(provider);
		
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
	};

	return (
		<div>
			<div>
				Mint NFT:
				<br />
				<label>
					Token ID:
					<input type="text" value={mintTokenId} onChange={e => setMintTokenId(e.target.value)} />
				</label>
				<label>
					Blueprint:
					<input type="text" value={mintBlueprint} onChange={e => setMintBlueprint(e.target.value)} />
				</label>
				<button onClick={mint}>Mint</button>
			</div>
			<br />
		</div>
	);
}

export default Coins;
