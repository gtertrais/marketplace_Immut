# Immutable X integration example
This is a skeleton React app for the purpose of providing code examples for building a marketplace on Immutable X. It covers:
- View sell orders and buying NFTs
- View Immutable X inventory and ETH balance
- Creating and cancelling sell orders
- Minting on Immutable X
- Depositing and withdrawing ETH and NFTs

## Polling
If you want to maintain a state of the entire Immutable X ecosystem in a local database, you currently have to poll our API endpoints and update events in your database accordingly. We will be looking at adding webhooks in the future.


| Endpoint  | Action |
| ---  | --- |
| `/mints` | Insert new asset |
| `/transfers` | Update asset ownership |
| `/trades` | Update asset ownership |
| `/orders` | Add and update orders |
| `/withdrawals` | Set asset status to eth / update balance |
| `/deposits` | Set asset status to imx / update balance |


## Available Scripts

In the project directory, you can run:

### `npx yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.
