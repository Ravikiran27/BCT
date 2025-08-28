import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
// ...existing code...
import { ethers } from 'ethers';
import { getContract } from '../metamask/contractInstance';

const STATUS_TRANSFERRED = '1'; // Product transferred to distributor
const STATUS_RECEIVED = '2'; // Distributor received product

export default function DistributorPage() {
  const [products, setProducts] = useState([]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [transferId, setTransferId] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferResult, setTransferResult] = useState(null);

  // Get connected wallet address
  useEffect(() => {
    async function fetchAddress() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        setAddress(accounts[0]);
      }
    }
    fetchAddress();
  }, []);

  // List products needing acceptance (status 1)
  const handleListProducts = async () => {
    if (!window.ethereum) {
      setResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);
      const nextId = await contract.nextProductId();
      const productList = [];
      console.log('Distributor address:', address);
      for (let i = 0; i < nextId; i++) {
        const p = await contract.getProduct(i);
        console.log(`Product ${i}:`, p);
        // Only show products owned by distributor and status is 1 (transferred)
        if (p[3].toLowerCase() === address.toLowerCase() && p[4].toString() === STATUS_TRANSFERRED) {
          productList.push({
            id: p[0].toString(),
            name: p[1],
            description: p[2],
            productOwner: p[3],
            status: p[4].toString(),
            isCounterfeit: p[5]
          });
        }
      }
      console.log('Filtered products:', productList);
      setProducts(productList);
      setResult(null);
    } catch (err) {
      setResult(err.message);
      console.error(err);
    }
    setLoading(false);
  };

  // Accept product
  const handleAccept = async (productId) => {
    if (!window.ethereum) {
      setResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const before = await contract.getProduct(Number(productId));
      console.log('Before acceptProduct:', before);
      const tx = await contract.acceptProduct(Number(productId));
      await tx.wait();
      const after = await contract.getProduct(Number(productId));
      console.log('After acceptProduct:', after);
      setResult('Product accepted! Tx: ' + tx.hash);
      handleListProducts(); // Refresh list
    } catch (err) {
      setResult(err.message);
      console.error(err);
    }
    setLoading(false);
  };

  // Transfer product to retailer (only products with status 2)
  const handleTransfer = async () => {
    if (!window.ethereum) {
      setTransferResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      // Check product status before transfer
      const before = await contract.getProduct(Number(transferId));
      console.log('Before transferProduct:', before);
      if (before[3].toLowerCase() !== address.toLowerCase() || before[4].toString() !== STATUS_RECEIVED) {
        setTransferResult('Product must be received (status 2) and owned by distributor before transfer.');
        setLoading(false);
        return;
      }
      const tx = await contract.transferProduct(Number(transferId), transferTo);
      await tx.wait();
      const after = await contract.getProduct(Number(transferId));
      console.log('After transferProduct:', after);
      setTransferResult('Product transferred! Tx: ' + tx.hash);
    } catch (err) {
      setTransferResult(err.message);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4, background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)', minHeight: '100vh' }}>
      <Typography variant="h3" align="center" sx={{ color: '#0d47a1', fontWeight: 700, mb: 4, textShadow: '0 2px 8px #fff' }}>
        Distributor Dashboard
      </Typography>

      <Card sx={{ mb: 4, boxShadow: 6, background: '#fff', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>Products to Accept</Typography>
          <Button variant="outlined" color="primary" onClick={handleListProducts} disabled={loading} sx={{ mb: 2, minWidth: 120 }}>List Products</Button>
          {products.length > 0 && (
            <TableContainer sx={{ borderRadius: 2, boxShadow: 2, background: '#f5f5f5' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ background: '#e3f2fd' }}>
                    <TableCell sx={{ color: '#0d47a1', fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ color: '#0d47a1', fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ color: '#0d47a1', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ color: '#0d47a1', fontWeight: 'bold' }}>Owner</TableCell>
                    <TableCell sx={{ color: '#0d47a1', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: '#0d47a1', fontWeight: 'bold' }}>Counterfeit</TableCell>
                    <TableCell sx={{ color: '#0d47a1', fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((p, idx) => (
                    <TableRow key={idx} sx={{ background: idx % 2 === 0 ? '#f0f4c3' : '#fffde7' }}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.description}</TableCell>
                      <TableCell>{p.productOwner}</TableCell>
                      <TableCell>{p.status}</TableCell>
                      <TableCell>{p.isCounterfeit ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary" onClick={() => handleAccept(p.id)} disabled={loading} sx={{ minWidth: 100 }}>Accept</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {result && <Typography sx={{ mt: 2, color: '#d32f2f', fontWeight: 500 }}>{result}</Typography>}
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, boxShadow: 6, background: '#fff', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>Transfer Product to Retailer</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Product ID" value={transferId} onChange={e => setTransferId(e.target.value)} variant="outlined" size="small" />
            <TextField label="Retailer Address" value={transferTo} onChange={e => setTransferTo(e.target.value)} variant="outlined" size="small" />
            <Button variant="contained" color="primary" onClick={handleTransfer} disabled={loading} sx={{ minWidth: 120 }}>Transfer</Button>
          </Box>
          {transferResult && <Typography sx={{ mt: 2, color: '#388e3c', fontWeight: 500 }}>{transferResult}</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
}
