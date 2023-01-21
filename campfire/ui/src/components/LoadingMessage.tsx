import React from "react";
import { Flex, Text } from "@holium/design-system";
import { observer } from "mobx-react";
import { deSig } from "@urbit/api";

interface LoadingMessageProps {
    connectionState: string;
    peer: string;
}
export const LoadingMessage = observer(({ connectionState, peer }: LoadingMessageProps) => {
    return (
        <>
            {connectionState == "dialing" && (
                <Flex mt={2}>
                    <Text mr={1} fontSize={5} fontWeight={400} opacity={0.9}>
                        Dialing{" "}
                    </Text>
                    <Text fontSize={5} fontWeight={500} opacity={0.9}>
                        {"~" + deSig(peer)}
                    </Text>
                    <Text fontSize={5} fontWeight={400} opacity={0.9}>
                        ...
                    </Text>
                </Flex>
            )}
            {connectionState == "ringing" && (
                <Flex mt={2}>
                    <Text mr={1} fontSize={5} fontWeight={400} opacity={0.9}>
                        Waiting for{" "}
                    </Text>
                    <Text fontSize={5} fontWeight={500} opacity={0.9}>
                        {"~" + deSig(peer)} to answer the
                        call
                    </Text>
                    <Text fontSize={5} fontWeight={400} opacity={0.9}>
                        ...
                    </Text>
                </Flex>
            )}
            {connectionState == "answering" && (
                <Flex mt={2}>
                    <Text mr={1} fontSize={5} fontWeight={400} opacity={0.9}>
                        Answering{" "}
                    </Text>
                    <Text fontSize={5} fontWeight={500} opacity={0.9}>
                        {"~" + deSig(peer)}&apos;s call
                    </Text>
                    <Text fontSize={5} fontWeight={400} opacity={0.9}>
                        ...
                    </Text>
                </Flex>
            )}
            {connectionState.includes("connected") && (
                <>
                    <Flex mt={2}>
                        <Text fontSize={5} fontWeight={400} opacity={0.9}>
                            Please wait while you connect to{" "}
                        </Text>
                        <Text fontSize={5} fontWeight={500} opacity={0.9}>
                            {"~" + deSig(peer)}
                        </Text>
                        <Text fontSize={5} fontWeight={400} opacity={0.9}>
                            ...
                        </Text>
                    </Flex>
                    <Text fontSize={2} fontWeight={200} opacity={0.9}>
                        may take a minute to start this p2p connection
                    </Text>
                </>
            )}
        </>
    );
});
