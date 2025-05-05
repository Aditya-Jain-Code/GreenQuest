"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { createUser } from "@/utils/db/actions/users";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const clientId = process.env.WEB3AUTH_CLIENT_ID;

// ✅ Sepolia Testnet Config
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://sepolia.infura.io/v3/275e6ce11c374a4cae8ab243d2b898b4",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

export default function LoginPage() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      router.push("/");
    }
  }, [router]);

  // ✅ Initialize Web3Auth
  useEffect(() => {
    async function initWeb3Auth() {
      try {
        const web3authInstance = new Web3Auth({
          clientId: clientId!,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        });

        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);
        setProvider(web3authInstance.provider);
      } catch (err) {
        console.error("Web3Auth Init Error:", err);
        toast.error("Failed to initialize Web3Auth.");
      }
    }

    initWeb3Auth();
  }, []);

  // ✅ Handle Login
  const handleLogin = async () => {
    if (!web3auth) {
      toast.error("Web3Auth is not ready yet. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const web3authProvider = await web3auth.connect();
      if (!web3authProvider) {
        toast.error("Failed to connect with Web3Auth.");
        return;
      }

      const userInfo = await web3auth.getUserInfo();

      if (userInfo?.email) {
        // ✅ Save user in DB
        await createUser(userInfo.email, userInfo.name || "Anonymous User");

        // ✅ Store email locally and redirect
        localStorage.setItem("userEmail", userInfo.email);
        toast.success("Login successful!");
        router.push("/");
        window.location.reload();
      } else {
        toast.error("Failed to retrieve user info.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-4">
          🌱 Welcome to Green-Quest
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Sign in to begin your eco journey.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center ${
            loading && "cursor-not-allowed opacity-70"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            "Sign In with Web3Auth"
          )}
        </button>

        <div className="mt-6 text-center text-gray-500 text-sm">
          By signing in, you agree to our{" "}
          <a href="#" className="text-green-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-green-600 hover:underline">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
