import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../metamask/contractInstance';
import { Box, Typography, Card, CardContent, TextField, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export default function ManufacturerPage() {
  const handleAddProduct = async () => {
    if (!window.ethereum) {
      setResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.addProduct(name, description);
      await tx.wait();
      setResult('Product added! Tx: ' + tx.hash);
      setName('');
      setDescription('');
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  };
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [transferId, setTransferId] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferResult, setTransferResult] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  // List all products (debug/visibility)
  const handleListAllProducts = async () => {
    if (!window.ethereum) {
      setResult('MetaMask not installed');
      return;
    }
    // TODO: Add logic to fetch all products and update state
    setLoading(false);
  };

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
      for (let i = 0; i < nextId; i++) {
        const p = await contract.getProduct(i);
        // p is a tuple: [id, name, description, owner, status, isCounterfeit]
        productList.push({
          id: p[0].toString(),
          name: p[1],
          description: p[2],
          productOwner: p[3],
          status: p[4].toString(),
          isCounterfeit: p[5]
        });
      }
      setProducts(productList);
      setResult(null);
    } catch (err) {
      setResult(err.message);
      console.error(err);
    }
    setLoading(false);
  };

  const handleTransferProduct = async () => {
    if (!window.ethereum) {
      setTransferResult('MetaMask not installed');
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.transferProduct(Number(transferId), transferTo);
      await tx.wait();
      setTransferResult('Product transferred! Tx: ' + tx.hash);
    } catch (err) {
      setTransferResult(err.message);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4, background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)', minHeight: '100vh' }}>
      <Typography variant="h3" align="center" sx={{ color: '#0d47a1', fontWeight: 700, mb: 4, textShadow: '0 2px 8px #fff' }}>
        Manufacturer Dashboard
      </Typography>

      <Card sx={{ mb: 4, boxShadow: 6, background: '#fff', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>Add Product</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Product Name" value={name} onChange={e => setName(e.target.value)} variant="outlined" size="small" fullWidth />
            <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} variant="outlined" size="small" fullWidth />
            <Button variant="contained" color="primary" onClick={handleAddProduct} disabled={loading} sx={{ minWidth: 120 }}>Add Product</Button>
          </Box>
          {result && <Typography sx={{ mt: 2, color: '#d32f2f', fontWeight: 500 }}>{result}</Typography>}
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, boxShadow: 6, background: '#fff', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>List Products</Typography>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, boxShadow: 6, background: '#fff', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>Transfer Product</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Product ID" value={transferId} onChange={e => setTransferId(e.target.value)} variant="outlined" size="small" />
            <TextField label="Distributor Address" value={transferTo} onChange={e => setTransferTo(e.target.value)} variant="outlined" size="small" />
            <Button variant="contained" color="primary" onClick={handleTransferProduct} disabled={loading} sx={{ minWidth: 120 }}>Transfer</Button>
          </Box>
          {transferResult && <Typography sx={{ mt: 2, color: '#388e3c', fontWeight: 500 }}>{transferResult}</Typography>}
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
