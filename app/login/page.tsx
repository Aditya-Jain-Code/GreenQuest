// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Poppins } from "next/font/google";
import { ArrowRight } from "lucide-react";

const poppins = Poppins({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
});

const clientId = process.env.WEB3_AUTH_CLIENT_ID;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [web3auth, setWeb3Auth] = useState(null);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
          privateKeyProvider,
        });

        await web3authInstance.initModal();
        setWeb3Auth(web3authInstance);

        if (web3authInstance.connected) {
          router.push("/"); // Redirect to home after login
        }
      } catch (error) {
        console.error("Web3Auth initialization error:", error);
      }
      setLoading(false);
    };
    initWeb3Auth();
  }, [router]);

  const login = async () => {
    if (!web3auth) return;
    await web3auth.connect();
    router.push("/"); // Redirect to home after login
  };

  return (
    <div className={`container mx-auto px-4 py-16 ${poppins.className}`}>
      <div className="max-w-lg mx-auto bg-white p-10 rounded-3xl shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Sign in to continue your journey in sustainable waste management.
        </p>
        <Button
          onClick={login}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-4 rounded-full font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign In with our Platform"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
