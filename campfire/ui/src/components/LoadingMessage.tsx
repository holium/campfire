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
                <Flex mt={2} className='flex-col sm:flex-row'>
                    <Text mr={1} fontSize={5} fontWeight={400} opacity={0.9} className="text-center sm:text-left">
                        Dialing{" "}
                    </Text>
                    <Flex className="justify-center sm:justify-start">
                        <Text fontSize={5} fontWeight={500} opacity={0.9}>
                            {"~" + deSig(peer)}
                        </Text>
                        <Text fontSize={5} fontWeight={400} opacity={0.9}>
                            ...
                        </Text>
                    </Flex>
                </Flex>
            )}
            {connectionState == "ringing" && (
                <Flex mt={2} className='flex-col sm:flex-row'>
                    <Text mr={1} fontSize={5} fontWeight={400} opacity={0.9} className="text-center sm:text-left">
                        Waiting for{" "}
                    </Text>
                    <Text fontSize={5} fontWeight={500} opacity={0.9} className="text-center sm:text-left">
                        {"~" + deSig(peer)}
                        &nbsp;
                    </Text>
                    <Flex className="justify-center sm:justify-start">
                        <Text fontSize={5} fontWeight={500} opacity={0.9} className="whitespace-nowrap">
                            {" "}
                            to answer the call
                        </Text>
                        <Text fontSize={5} fontWeight={400} opacity={0.9}>
                            ...
                        </Text>
                    </Flex>
                </Flex>
            )}
            {connectionState == "answering" && (
                <Flex mt={2} className="flex-col sm:flex-row">
                    <Text mr={1} fontSize={5} fontWeight={400} opacity={0.9} className="text-center sm:text-left">
                        Answering{" "}
                    </Text>
                    <Flex className="justify-center sm:justify-start">
                        <Text fontSize={5} fontWeight={500} opacity={0.9} >
                            {"~" + deSig(peer)}&apos;s call
                        </Text>
                        <Text fontSize={5} fontWeight={400} opacity={0.9}>
                            ...
                        </Text>
                    </Flex>
                </Flex>
            )}
            {connectionState.includes("connected") && (
                <>
                    <Flex mt={2} className="flex-col sm:flex-row justify-center flex-wrap">
                        <Text fontSize={5} fontWeight={400} opacity={0.9} className="text-center sm:text-left">
                            Please wait while you connect to{" "}
                        </Text>
                        <Flex className="justify-center items-center mx-auto">
                            <Text fontSize={5} fontWeight={500} opacity={0.9}>
                                {"~" + deSig(peer)}
                            </Text>
                            <Text fontSize={5} fontWeight={400} opacity={0.9} className="hidden sm:inline-block">
                                ...
                            </Text>
                        </Flex>
                    </Flex>
                    <Text fontSize={2} fontWeight={200} opacity={0.9} className="text-center sm:text-left">
                        may take a minute to start this p2p connection
                    </Text>
                </>
            )}
        </>
    );
});
