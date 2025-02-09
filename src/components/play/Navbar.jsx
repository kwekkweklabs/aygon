import { useAuth } from '@/providers/AuthProvider'
import { Button, Card, Input, Modal, ModalBody, ModalContent, ModalHeader, Popover, PopoverContent, PopoverTrigger, Tab, Tabs } from '@heroui/react'
import { CopyIcon, LogOutIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router';

export default function Navbar() {
  const { me, authenticated } = useAuth()
  return (
    <div className='fixed top-0 w-full bg-[#191430] p-4 z-50'>
      <div className='flex flex-row items-center justify-between'>
        <Link to="/play">
          <img src='/aygon-logo.png' alt='Aygon Logo' className='w-[8rem]' />
        </Link>

        {(me && authenticated) &&
          <AccountButton />
        }
      </div>
    </div>
  )
}

const AccountButton = () => {
  const { me, logout } = useAuth()
  return (
    <div className='flex flex-row items-centar gap-4'>
      <WalletButton />

      <Popover placement='bottom'>
        <PopoverTrigger>
          <Button
            color='primary'
            className='bg-white/10 px-4 py-4 h-[3rem]'
            size='lg'
          >
            <div className='flex flex-row items-center gap-4'>
              {/* Alias avatar */}
              <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center'>
                <p className='text-white text-lg font-light'>{me.email[0]}</p>
              </div>
              <div>{me.email}</div>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className='dark'>
          <div className='flex flex-col gap-4 p-2 w-[10rem]'>
            <Button
              color='danger'
              variant='light'
              fullWidth
              size='lg'
              onPress={logout}
            >
              <div className='flex flex-row items-center justify-between gap-2 w-full'>
                <div>
                  Logout
                </div>
                <LogOutIcon />
              </div>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

const WalletButton = () => {
  const { me, accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const address = me?.privyWalletAddress;

  const [balance, setBalance] = useState(null);
  const BUFFER_AMOUNT = 0.0001;

  const handleFetchBalance = async () => {
    try {
      const rpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC;
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const balance = parseInt(data.result, 16) / 1e18;
        setBalance(balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  useEffect(() => {
    handleFetchBalance();
    const interval = setInterval(() => {
      handleFetchBalance();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const validateWithdrawal = (amount) => {
    setWithdrawError('');

    if (!amount || amount <= 0) {
      setWithdrawError('Please enter a valid amount');
      return false;
    }

    const numAmount = parseFloat(amount);
    const maxWithdrawable = balance - BUFFER_AMOUNT;

    if (numAmount > maxWithdrawable) {
      setWithdrawError(`Maximum withdrawal amount is ${maxWithdrawable.toFixed(4)} ETH (keeping ${BUFFER_AMOUNT} ETH for gas)`);
      return false;
    }

    return true;
  };

  const handleWithdrawAmountChange = (e) => {
    const value = e.target.value;
    setWithdrawAmount(value);
    if (value) {
      validateWithdrawal(value);
    } else {
      setWithdrawError('');
    }
  };

  const handleWithdraw = async () => {
    if (!validateWithdrawal(withdrawAmount)) {
      return;
    }

    try {
      setIsWithdrawing(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          recipient: withdrawAddress,
        }),
      });

      handleCloseModal();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Add success toast here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setWithdrawAmount('');
    setWithdrawAddress('');
    setWithdrawError('');
    setIsWithdrawing(false);
  };

  return (
    <div className="dark">
      <Button
        className="bg-white/10 z-50 relative"
        size="lg"
        onClick={() => setIsOpen(true)}
        startContent={
          <img
            src="https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628"
            alt="ETH"
            className="w-5 h-5"
          />
        }
      >
        {balance ? parseFloat(balance.toFixed(4)) : 0} ETH
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        size="2xl"
        className="dark"
        isDismissable={!isWithdrawing}
        hideCloseButton={isWithdrawing}
      >
        <ModalContent>
          <ModalHeader>
            <div className="w-full text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Base Sepolia Testnet
              </p>
              <p className="text-xl font-semibold mt-2">
                {balance ? parseFloat(balance.toFixed(4)) : 0} ETH
              </p>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              {/* Deposit Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Deposit</h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCodeSVG
                    value={address || ''}
                    size={160}
                    level="H"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-lg w-full">
                  <Input
                    value={address}
                    readOnly
                    className="w-full font-mono text-sm"
                    label="Wallet Address"
                  />
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={() => copyToClipboard(address)}
                  >
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Deposit ETH to this address on Base Sepolia Testnet
                </p>
              </div>

              {/* Withdraw Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Withdraw</h3>
                <Input
                  type="number"
                  label="Amount (ETH)"
                  placeholder="0.0"
                  value={withdrawAmount}
                  onChange={handleWithdrawAmountChange}
                  errorMessage={withdrawError}
                  isInvalid={!!withdrawError}
                  startContent={
                    <img
                      src="https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628"
                      alt="ETH"
                      className="w-5 h-5"
                    />
                  }
                  description={`Available: ${balance ? (balance - BUFFER_AMOUNT).toFixed(4) : 0} ETH`}
                />

                <Input
                  label="Recipient Address"
                  placeholder="0x..."
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                />

                <Button
                  color="primary"
                  onClick={handleWithdraw}
                  isDisabled={!withdrawAmount || !withdrawAddress || !!withdrawError || isWithdrawing}
                  isLoading={isWithdrawing}
                  className="w-full"
                >
                  Withdraw
                </Button>
                <p className="text-xs text-gray-400">
                  {BUFFER_AMOUNT} ETH will be kept for gas fees
                </p>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};