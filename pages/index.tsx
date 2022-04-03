import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { sanityClient, urlFor } from '../sanity'
import { Collection } from '../typings'

const Home: NextPage<{ collections: Collection[] }> = ({ collections }) => {
  return (
    <div className="mx-auto mt-4 flex min-h-screen max-w-7xl flex-col px-10 pb-20 2xl:px-0">
      <Head>
        <title>JAK NFT Drop App</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="">
        <h1 className="mb-10 text-4xl font-extralight">
          The{' '}
          <span className="font-extrabold underline decoration-pink-600/50">
            JAK
          </span>{' '}
          NFT Market Place
        </h1>
        <main className="bg-slate-100 p-10 shadow-xl shadow-rose-400/20">
          <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {collections.map((collection) => (
              <Link href={`/nft/${collection.slug.current}`}>
                <div
                  className="flex cursor-pointer flex-col items-center transition-all duration-200 hover:scale-105"
                  id={collection._id}
                >
                  <img
                    src={urlFor(collection.mainImage).url()}
                    alt=""
                    className="h-96 w-60 rounded-2xl object-cover"
                  />
                  <div className="p-5">
                    <h2 className="text-3xl">{collection.title}</h2>
                    <p className="mt-2 text-sm text-gray-400">
                      {collection.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async (context) => {
  const query = `
  *[_type == "collection"] {
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

  const collections = await sanityClient.fetch(query)

  return {
    props: {
      collections,
    },
  }
}
