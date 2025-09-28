import Head from 'next/head'
import dynamic from 'next/dynamic'

const Chatbot = dynamic(() => import('../components/Chatbot'), { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>SevaBot — Chat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
        <h1>SevaBot</h1>
        <Chatbot />
      </main>
    </>
  )
}