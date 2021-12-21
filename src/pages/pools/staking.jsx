import Head from "next/head";

import { PoolsPage } from "@/components/pages/pools";

export default function Pools() {
  return (
    <div>
      <Head>
        <title>Neptune Mutual</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PoolsPage active="staking">Staking</PoolsPage>
    </div>
  );
}
