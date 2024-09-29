const { ethers } = window.ethers;
const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserOrders",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "orders",
        "outputs": [
            {
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenContract",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "tokenName",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "tokenAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "priceInETH",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "expirationTime",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "uniqueName",
                "type": "string"
            }
        ],
        "name": "buyOrder",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "uniqueName",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "tokenContract",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "tokenName",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "tokenAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "priceInETH",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "expirationTime",
                "type": "uint256"
            }
        ],
        "name": "createOrder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "uniqueName",
                "type": "string"
            }
        ],
        "name": "cancelOrder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const erc20Abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];


const contractAddress = "0xE534119307362DB466BF7196c403EB6B9c121aC5";
let provider;
let signer;
let contract;

document.addEventListener("DOMContentLoaded", function() {
    function showPage() {
        const sections = document.querySelectorAll('section');
        const currentHash = window.location.hash || '#home'; 
        sections.forEach(section => {
            section.style.display = 'none';
        });
        const activeSection = document.querySelector(currentHash);
        if (activeSection) {
            activeSection.style.display = 'block';
        }
    }

    window.addEventListener('hashchange', showPage);
    showPage();
});


document.getElementById('connectWallet').addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        const address = await signer.getAddress();
        
        document.getElementById('walletAddress').innerText = address.slice(0, 6) + '...' + address.slice(-4);
       
        document.getElementById('connectWallet').style.display = 'none'; 
        fetchOrders();
    } else {
        alert('Please install MetaMask!');
    }
});
async function switchToMinatoNetwork() {
    // Minato Testnet Network configuration
    const minatoNetwork = {
        chainId: '0x79a', // Hexadecimal for 1946
        chainName: 'Minato',
        nativeCurrency: {
            name: 'Minato ETH',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://rpc.minato.soneium.org'],
        blockExplorerUrls: ['https://explorer-testnet.soneium.org']
    };

    if (typeof window.ethereum !== 'undefined') {
        try {
            // Automatically switch to the Minato network when the page loads
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [minatoNetwork]
            });
            console.log('Switched to Minato network');
        } catch (error) {
            console.error('Error switching to Minato network:', error);
            alert('Failed to switch to the Minato testnet.');
        }
    } else {
        alert('MetaMask is not installed. Please install MetaMask and try again.');
    }
}


window.addEventListener('load', async () => {
    await switchToMinatoNetwork();
});

document.getElementById('tokenContract').addEventListener('input', async () => {
        const tokenContractAddress = document.getElementById('tokenContract').value;

        if (ethers.utils.isAddress(tokenContractAddress)) {
            try {
                // Initialize the token contract
                const tokenContract = new ethers.Contract(tokenContractAddress, erc20Abi, signer);

                // Fetch the token name
                const tokenName = await tokenContract.name();

                // Set the fetched token name in the input field
                document.getElementById('tokenName').value = tokenName;
            } catch (error) {
                console.error('Error fetching token name:', error);
                document.getElementById('tokenName').value = ''; // Clear token name if error
            }
        } else {
            document.getElementById('tokenName').value = ''; // Clear token name if the address is invalid
        }
    });

    // Create order logic
    document.getElementById('createOrder').addEventListener('click', async () => {
        const tokenContractAddress = document.getElementById('tokenContract').value;
        const tokenName = document.getElementById('tokenName').value;
        const uniqueName = document.getElementById('sellUniqueName').value;
        const tokenAmount = document.getElementById('tokenAmount').value;
        const priceInETH = ethers.utils.parseEther(document.getElementById('priceInETH').value);
        const expirationTime = Math.floor(Date.now() / 1000) + parseInt(document.getElementById('expirationTime').value) * 3600;

        // Initialize the token contract
        const tokenContract = new ethers.Contract(tokenContractAddress, erc20Abi, signer);

        try {
            // Fetch the token decimals
            const decimals = await tokenContract.decimals();

            // Convert the token amount to the correct decimals
            const tokenAmountWithDecimals = ethers.utils.parseUnits(tokenAmount, decimals);

            // Approve the marketplace contract to spend the tokens
            const approvalTx = await tokenContract.approve(contractAddress, tokenAmountWithDecimals);
            await approvalTx.wait();
            alert('Token spending approved successfully!');

            // After approval, create the order
            const tx = await contract.createOrder(uniqueName, tokenContractAddress, tokenName, tokenAmountWithDecimals, priceInETH, expirationTime);
            await tx.wait();
            alert('Order created successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to create order or approve token spending.');
        }
    });

async function fetchOrders() {
    const address = await signer.getAddress();
    const orders = await contract.getUserOrders(address);

    let myOrdersHtml = '';
    for (let uniqueName of orders) {
        const order = await contract.orders(uniqueName);
        if (order.active) {
            myOrdersHtml += `
                <div>
                    <p>Unique Name: ${uniqueName}</p>
                    <button onclick="cancelOrder('${uniqueName}')">Cancel Order</button>
                </div>
            `;
        }
    }
    document.getElementById('myOrders').innerHTML = myOrdersHtml;
}

async function cancelOrder(uniqueName) {
    try {
        const tx = await contract.cancelOrder(uniqueName);
        await tx.wait();
        alert('Order canceled successfully!');
        fetchOrders(); 
    } catch (error) {
        console.error(error);
        alert('Failed to cancel order.');
    }
}

document.getElementById('fetchOrder').addEventListener('click', async () => {
    const uniqueName = document.getElementById('uniqueName').value;
    const order = await contract.orders(uniqueName);

    const tokenContract = new ethers.Contract(order.tokenContract, erc20Abi, provider);
    const decimals = await tokenContract.decimals();
    const tokenAmountFormatted = ethers.utils.formatUnits(order.tokenAmount, decimals);
    const orderDetails = `
        <p>Seller: <a href="https://explorer-testnet.soneium.org/address/${order.seller}" target="_blank">${order.seller}</a></p>
        <p>Token Contract: <a href="https://explorer-testnet.soneium.org/address/${order.tokenContract}" target="_blank">${order.tokenContract}</a></p>
        <p>Token Name: ${order.tokenName}</p>
        <p>Token Amount: ${tokenAmountFormatted}</p>
        <p>Price in ETH: ${ethers.utils.formatEther(order.priceInETH)}</p>
        <p>Expiration Time: ${new Date(order.expirationTime * 1000).toLocaleString()}</p>
        <p>Active: ${order.active}</p>
        <button id="payButton">Pay</button>
    `;
    
    document.getElementById('orderDetails').innerHTML = orderDetails;
    document.getElementById('payButton').addEventListener('click', () => showConfirmation(uniqueName, order.priceInETH));
});
function showConfirmation(uniqueName, priceInETH) {
    if (confirm("Please ensure that you have entered the correct order name and token address. If you make a mistake, we will not refund you.")) {
        buyOrder(uniqueName, priceInETH);
    }
}

async function buyOrder(uniqueName, priceInETH) {
    try {
        const tx = await contract.buyOrder(uniqueName, { value: priceInETH });
        await tx.wait();
        alert('Order purchased successfully!');
    } catch (error) {
        console.error(error);
        alert('Failed to purchase order.');
    }
}