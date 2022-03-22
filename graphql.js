const { ApolloClient, HttpLink, DefaultOptions, InMemoryCache } = require('@apollo/client/core');
const fetch = require('cross-fetch');
const gql = require('graphql-tag');
 
const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

async function main() {
    const client = new ApolloClient({
        link: new HttpLink({
            fetch,
            uri: 'https://subgraph.iott.network/subgraphs/name/iotex/pebble-subgraph',
        }),
        cache: new InMemoryCache()
    });

    const queryResult = await client.query({
        query: gql`
        {
            devices (where : {address : "0xe07806d11cbb41e29a95fdc6f4b27ee95291b603"}){
              id
              name
              address
              firmware
              lastDataTime
              data
              config
              owner
            }
          }
        `,
    });

    //console.log(_.get(data, 'data.data.devices'));
    console.log(queryResult.data.devices);
}

main();