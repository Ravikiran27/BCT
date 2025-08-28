

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../metamask/contractInstance';
import { Box, Typography, Card, CardContent, TextField, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, FormControlLabel } from '@mui/material';

export default function RetailerPage() {

  const [productId, setProductId] = useState('');
  const [available, setAvailable] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyResult, setHistoryResult] = useState(null);
  const [consumerAddress, setConsumerAddress] = useState('');
    const [allProducts, setAllProducts] = useState([]);

  const handleCheckHistory = async (productId) => {
    if (!window.ethereum) {
      setHistoryResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);
      const filterTransfer = contract.filters.OwnershipTransferred(Number(productId));
      const filterAccepted = contract.filters.ProductAccepted(Number(productId));
      const filterReceived = contract.filters.ProductReceived(Number(productId));
      const filterAvailable = contract.filters.AvailabilityUpdated(Number(productId));
      const filterCounterfeit = contract.filters.CounterfeitReported(Number(productId));

      const logsTransfer = await contract.queryFilter(filterTransfer);
      const logsAccepted = await contract.queryFilter(filterAccepted);
      const logsReceived = await contract.queryFilter(filterReceived);
      const logsAvailable = await contract.queryFilter(filterAvailable);
      const logsCounterfeit = await contract.queryFilter(filterCounterfeit);

      const history = [];
      logsTransfer.forEach(log => {
        history.push({
          type: 'OwnershipTransferred',
          from: log.args.from,
          to: log.args.to,
          tx: log.transactionHash,
          block: log.blockNumber
        });
      });
      logsAccepted.forEach(log => {
        history.push({
          type: 'ProductAccepted',
          distributor: log.args.distributor,
          tx: log.transactionHash,
          block: log.blockNumber
        });
      });
      logsReceived.forEach(log => {
        history.push({
          type: 'ProductReceived',
          retailer: log.args.retailer,
          tx: log.transactionHash,
          block: log.blockNumber
        });
      });
      logsAvailable.forEach(log => {
        history.push({
          type: 'AvailabilityUpdated',
          available: log.args.available,
          tx: log.transactionHash,
          block: log.blockNumber
        });
      });
      logsCounterfeit.forEach(log => {
        history.push({
          type: 'CounterfeitReported',
          consumer: log.args.consumer,
          tx: log.transactionHash,
          block: log.blockNumber
        });
      });

      history.sort((a, b) => a.block - b.block);
      setHistoryResult(JSON.stringify(history, null, 2));
    } catch (err) {
      setHistoryResult(err.message);
      console.error(err);
    }
    setLoading(false);
  };

  // Sell to consumer (transfer ownership)
  const handleSellToConsumer = async () => {
    if (!window.ethereum) {
      setResult('MetaMask not installed');
      return;
    }
    if (!consumerAddress) {
      setResult('Enter consumer address');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.transferProduct(Number(productId), consumerAddress);
      await tx.wait();
      setResult('Product sold to consumer! Tx: ' + tx.hash);
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  };

  const handleReceive = async () => {
    if (!window.ethereum) {
      setResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.receiveProduct(Number(productId));
      await tx.wait();
      setResult('Product received! Tx: ' + tx.hash);
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  };

  const handleUpdateAvailability = async () => {
    if (!window.ethereum) {
      setResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.updateAvailability(Number(productId), available);
      await tx.wait();
      setResult('Availability updated! Tx: ' + tx.hash);
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  };


  // List all products (debug/visibility)
  const handleListAllProducts = async () => {
    if (!window.ethereum) {
      setResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);
      const nextId = await contract.nextProductId();
      const products = [];
      for (let i = 0; i < nextId; i++) {
        const p = await contract.getProduct(i);
        products.push({
          id: p[0].toString(),
          name: p[1],
          description: p[2],
          productOwner: p[3],
          status: p[4].toString(),
          isCounterfeit: p[5]
        });
      }
      setAllProducts(products);
      setResult(null);
    } catch (err) {
      setResult(err.message);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4, background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)', minHeight: '100vh' }}>
      <Typography variant="h3" align="center" sx={{ color: '#0d47a1', fontWeight: 700, mb: 4, textShadow: '0 2px 8px #fff' }}>
        Retailer Dashboard
      </Typography>

      <Card sx={{ mb: 4, boxShadow: 6, background: '#fff', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>Retailer Actions</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Product ID" value={productId} onChange={e => setProductId(e.target.value)} variant="outlined" size="small" />
            <Button variant="contained" color="primary" onClick={handleReceive} disabled={loading} sx={{ minWidth: 120 }}>Receive Product</Button>
            <Button variant="outlined" color="primary" onClick={() => handleCheckHistory(productId)} disabled={loading} sx={{ minWidth: 120 }}>History</Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FormControlLabel control={<Checkbox checked={available} onChange={e => setAvailable(e.target.checked)} />} label="Available for Consumers" />
            <Button variant="contained" color="primary" onClick={handleUpdateAvailability} disabled={loading} sx={{ minWidth: 120 }}>Update Availability</Button>
            <Button variant="outlined" color="primary" onClick={() => handleCheckHistory(productId)} disabled={loading} sx={{ minWidth: 120 }}>History</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Consumer Address" value={consumerAddress} onChange={e => setConsumerAddress(e.target.value)} variant="outlined" size="small" />
            <Button variant="contained" color="primary" onClick={handleSellToConsumer} disabled={loading} sx={{ minWidth: 120 }}>Sell to Consumer</Button>
          </Box>
          {result && <Typography sx={{ mt: 2, color: '#d32f2f', fontWeight: 500 }}>{result}</Typography>}
          {historyResult && <Typography sx={{ mt: 2, color: '#388e3c', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{historyResult}</Typography>}
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 6, background: '#fff', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>All Products (Debug View)</Typography>
          <Button variant="outlined" color="primary" onClick={handleListAllProducts} disabled={loading} sx={{ mb: 2, minWidth: 120 }}>List All Products</Button>
          {allProducts.length > 0 && (
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allProducts.map((p, idx) => (
                    <TableRow key={idx} sx={{ background: idx % 2 === 0 ? '#f0f4c3' : '#fffde7' }}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.description}</TableCell>
                      <TableCell>{p.productOwner}</TableCell>
                      <TableCell>{p.status}</TableCell>
                      <TableCell>{p.isCounterfeit ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
