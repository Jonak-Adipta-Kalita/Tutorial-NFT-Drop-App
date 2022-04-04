import Head from 'next/head'
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNFTDrop,
} from '@thirdweb-dev/react'
import type { GetServerSideProps, NextPage } from 'next'
import { sanityClient, urlFor } from '../../sanity'
import { Collection } from '../../typings'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { BigNumber } from 'ethers'
import { NFTMetadataOwner } from '@thirdweb-dev/sdk'
import toast, { Toaster } from 'react-hot-toast'

const NFTDropPage: NextPage<{ collection: Collection }> = ({ collection }) => {
  const [claimedSupply, setClaimedSupply] = useState<number>(0)
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [priceInEth, setPriceInEth] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [claimedNFT, setClaimedNFT] = useState<NFTMetadataOwner | null>(null)

  const nftDrop = useNFTDrop(collection.address)
  const connectWithMetamask = useMetamask()
  const address = useAddress()
  const disconnect = useDisconnect()
  const router = useRouter()

  useEffect(() => {
    if (!nftDrop) return

    const fetchNFTDropData = async () => {
      setLoading(true)

      const claimed = await nftDrop.getAllClaimed()
      const total = await nftDrop.totalSupply()

      setClaimedSupply(claimed.length)
      setTotalSupply(total)

      setLoading(false)
    }

    const fetchPrice = async () => {
      setLoading(true)

      const claimConditions = await nftDrop.claimConditions.getAll()

      setPriceInEth(claimConditions?.[0].currencyMetadata.displayValue)

      setLoading(false)
    }

    fetchPrice()
    fetchNFTDropData()
  }, [nftDrop])

  const mintNFT = () => {
    if (!nftDrop || !address) return

    const quantity = 1

    setLoading(true)
    setClaimedNFT(null)

    const notification = toast.loading('Minting...', {
      style: {
        background: 'white',
        color: 'green',
        fontWeight: 'bolder',
        fontSize: '17px',
        padding: '20px',
      },
    })

    nftDrop
      .claimTo(address, quantity)
      .then(async (transactionData) => {
        const claimedNFT_ = await transactionData[0].data()

        setClaimedNFT(claimedNFT_)
        toast('HOORAY!! YOU SUCCESSFULLY MINTED!!', {
          duration: 8000,
          style: {
            background: 'green',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '17px',
            padding: '20px',
          },
        })
      })
      .catch((err) =>
        toast('Whoops!! Something went wrong!!', {
          style: {
            background: 'red',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '17px',
            padding: '20px',
          },
        })
      )
      .finally(() => {
        setLoading(false)
        setClaimedNFT(null)

        toast.dismiss(notification)
      })
  }

  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-10">
      <Head>
        <title>JAK NFT Drop App - {collection.nftCollectionName}</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Toaster position="bottom-center" />
      <div className="bg-gradient-to-br from-cyan-800 to-rose-500 lg:col-span-4">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600 p-2">
            <img
              src={urlFor(collection.previewImage).url()}
              alt="logo"
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
            />
          </div>
          <div className="space-y-2 p-5 text-center">
            <h1 className="text-2xl font-bold text-white">
              {collection.nftCollectionName}
            </h1>
            <h2 className="text-xl text-gray-300">{collection.description}</h2>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        <header className="flex items-center justify-between">
          <h1
            className="w-52 cursor-pointer text-xl font-extralight sm:w-80"
            onClick={() => router.push('/')}
          >
            The{' '}
            <span className="font-extrabold underline decoration-pink-600/50">
              JAK
            </span>{' '}
            NFT Market Place
          </h1>
          <button
            className="rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white lg:px-5 lg:py-3 lg:text-base"
            onClick={() => (address ? disconnect() : connectWithMetamask())}
          >
            {address ? 'Sign Out' : 'Sign In'}
          </button>
        </header>
        <hr className="my-2 border" />
        {address && (
          <p className="text-center text-sm text-rose-400">
            You are logged in with Wallet: {address.substring(0, 5)}...
            {address.substring(address.length - 5)}
          </p>
        )}
        <div className="mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:justify-center lg:space-y-0">
          <img
            src={urlFor(collection.mainImage).url()}
            className="w-80 object-cover pb-10 lg:h-40"
            alt=""
          />
          <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">
            {collection.title}
          </h1>
          {loading ? (
            <p className="animate-pulse p-2 text-xl font-semibold text-gray-700">
              Loading Supply count...
            </p>
          ) : (
            <p className="p-2 text-xl text-green-500">
              {claimedSupply}/{totalSupply?.toString()} NFT(s) claimed
            </p>
          )}

          {loading && (
            <img
              src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
              alt=""
              className="h-80 w-80 object-contain"
            />
          )}
        </div>
        <button
          className="mt-12 h-16 w-full rounded-full bg-red-500 font-bold text-white disabled:bg-gray-400"
          onClick={mintNFT}
          disabled={
            loading || claimedSupply === totalSupply?.toNumber() || !address
          }
        >
          {loading ? (
            <>Loading</>
          ) : claimedSupply === totalSupply?.toNumber() ? (
            <>Sold Out</>
          ) : !address ? (
            <>Sign in to Mint</>
          ) : (
            <span className="font-bold">Mint NFT ({priceInEth})</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default NFTDropPage

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `
  *[_type == "collection" && slug.current == $id][0] {
    _id,
    title,
    address,
    description,
    nftCollectionName,
    mainImage {
      asset
    },
    previewImage {
      asset
    },
    slug {
      current
    },
    creator -> {
      _id,
      name,
      address,
      slug {
        current
      },
    },
  }
  `

  const collection = await sanityClient.fetch(query, { id: params?.id })

  if (!collection)
    return {
      notFound: true,
    }

  return {
    props: {
      collection,
    },
  }
}
