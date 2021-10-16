import { BigNumber } from '@ethersproject/bignumber';
import { ERC20TokenType, ERC721TokenType, EthAddressBrand, ETHTokenType, ImmutableFeeType, ImmutableXClient, PositiveBigNumberBrand } from '@imtbl/imx-sdk';
import { Link } from '@imtbl/imx-sdk';
import { ImmutableMethodResults, ImmutableOrderStatus } from '@imtbl/imx-sdk';
import Web3 from 'web3';
import { useEffect, useState } from 'react';
import { Card, ListGroup, ListGroupItem, Row, Col, Container } from 'react-bootstrap';

require('dotenv').config();

interface MarketplaceProps {
	client: ImmutableXClient,
	link: Link
}

const Marketplace = ({ client, link }: MarketplaceProps) => {
	const [marketplace, setMarketplace] = useState<ImmutableMethodResults.ImmutableGetOrdersResult>(Object);
	const [buyOrderId, setBuyOrderId] = useState('');

	useEffect(() => {
		load()
	}, [])

	async function load(): Promise<void> {
		let orders = await client.getOrders({ status: ImmutableOrderStatus.active });
		for (var i = 0; i < orders.result.length; i++) {


		}
		setMarketplace(orders)
	};

	// buy an asset
	async function buyNFT(order_id = undefined) {

		if (order_id) {
			await link.buy({
				orderIds: [order_id]
			})
		} else {
			await link.buy({
				orderIds: [buyOrderId]
			})
		}
	};


	const getPrice = (item: any) => {
		let price = parseInt(item.buy.data.quantity._hex) / 1e18
		return price
	}

	async function handleBuy(item: any) {
		await setBuyOrderId(item.order_id)
		buyNFT()
	}


	return (
		<div>
			<div>
				<Container>
					<Row xs={1} md={3} className="g-4">
						{marketplace.result !== null && marketplace.result !== undefined && marketplace.result.map((item: any) => {
							if (item.sell.data.hasOwnProperty('properties')) {
								return (
									<Col>
										<Card style={{ width: '18rem' }} >
											<Card.Img variant="top" style={{ width: '100%', height: '15vw', objectFit: 'cover' }} src={item.sell.data.properties.image_url} />
											<Card.Body>
												<Card.Title>{item.sell.data.properties.name}</Card.Title>
											</Card.Body>
											<ListGroup className="list-group-flush">
												<ListGroupItem>{'Collection: ' + item.sell.data.properties.collection.name}</ListGroupItem>
												<ListGroupItem>{'Price: ' + getPrice(item) + ' ETH'}</ListGroupItem>
											</ListGroup>
											<Card.Body>
												<Card.Link onClick={() => buyNFT(item.order_id)}>Buy</Card.Link>
												<Card.Link href="#">Another Link</Card.Link>
											</Card.Body>
										</Card>
									</Col>)
							}
						}
						)}
					</Row>
				</Container>
			</div>
		</div>
	);
}

export default Marketplace;
