import React from 'react';
import { useStore } from '../stores/root';
import { Flex, Text } from "@holium/design-system";

// eslint-disable-next-line
export const SettingsDialog = () => {
  const { urchatStore } = useStore();
  const servers = urchatStore.configuration.iceServers;

  // poking from dojo works well with something like
  // :icepond &set-fetcher-config [%these-servers ~[[%server urls=~['stun:coturn.holium.live:3478'] auth=~]]]
  // const clickButton = () => {
  //   console.log("hit button");
  //   urchatStore.urbit.poke({
  //       app: 'icepond',
  //       mark: 'ice-server',
  //       json: {
  //         "server": {
  //           "urls": ["turn:asdad"],
  //           "authentication": {}
  //         }
  //       }
  //     }
  //   )
  // }


  return (
    <div className="settingsDialog rounded-xl overflow-hidden ">
      <Flex className="h-min w-full rounded-xl max-h-full pt-4 pb-6 px-8"
        flexDirection='column'
        style={{
          maxHeight: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div className="iceServers">
          <Text fontSize={6} fontWeight={500}>ICE Servers</Text>
          <span>Below are the ICE servers that Campfire is currently configured to use for establshing it's peer-to-peer connections. These servers can be set for your ship, and some may be fetched from your sponsor.</span>
          <br />
          <br />
          <ul>
            {servers.map((server, idx) => (
              <li key={idx}>{server.urls}</li>
            ))}
          </ul>
          <br />
          <a href="/docs/campfire/iceservers" title="link to %docs" target="_blank" rel="noopener noreferrer">
            <span>%docs for configuring ICE servers</span>
          </a>
          {/* <Button onClick={clickButton}>Add new server</Button> */}
        </div>
        <br />
        <div>
          <Text fontSize={6} fontWeight={500}>Extras</Text>
          <Text>Install %pals from <b>~paldev</b> and make some friends for Speed Dial capabilities.</Text>
          <Text>You can Speed Dial a ship by going directly to {window.location.href + "~sampel-palnet"} to initiate a call with <b>~sampel-palnet</b>.</Text>
        </div>
      </Flex>
    </div>
  );
}