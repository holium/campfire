
import { Flex, Button, Card, Ship, Text } from "@holium/design-system";
import { deSig } from "@urbit/api/dist";
import React from "react";
import { MdOutlineInsertDriveFile } from "react-icons/md";
import { useStore } from "../stores/root";
import { FileTransfer, FileTransferStatus } from "../stores/urchat";
import { downloadFile, formatBytes } from "../util";


interface SharedFileProps {
    fileTransfer: FileTransfer
}

export const SharedFile = ({ fileTransfer }: SharedFileProps) => {
    const { urchatStore } = useStore();


    const renderByFileStatus = (fileTransfer: FileTransfer) => {
        switch (fileTransfer.status) {
            case FileTransferStatus.Waiting:
                return (
                    fileTransfer.owner == urchatStore.urbit.ship ?
                        <Flex justifyContent='center' className='w-full '>
                            Waiting for {`~${deSig(urchatStore.ongoingCall.call.peer)}`}
                        </Flex>
                        :
                        <Flex justifyContent='space-between' className='w-full'>
                            <Button style={{ width: 'calc(50% - 8px)', backgroundColor: '#DEDEDE', color: 'black' }} onClick={() => rejectFile(fileTransfer)}>Reject</Button>
                            <Button style={{ width: 'calc(50% - 8px)' }} onClick={() => acceptFile(fileTransfer)}>Accept</Button>
                        </Flex>
                )
            case FileTransferStatus.Ongoing:
                return (<>
                    <div style={{ borderRadius: '8px' }} className='border-2 border-gray-300 relative overflow-hidden w-full h-6'>
                        <span className="block h-full absolute pr-2" style={{ backgroundColor: '#F8E390', textAlign: 'end', width: fileTransfer.progress + '%' }}>{fileTransfer.progress + '%'}</span>
                    </div>
                    <Button onClick={() => cancelTransfer(fileTransfer)}>Cancel</Button>
                </>)
            case FileTransferStatus.Cancelled:
                return (
                    <Flex justifyContent='center' className='w-full '>
                        Cancelled
                    </Flex>
                )
            case FileTransferStatus.Rejected:
                return (
                    <Flex justifyContent='center' className='w-full '>
                        Rejected
                    </Flex>
                )
            case FileTransferStatus.Completed:
                return (
                    fileTransfer.owner == urchatStore.urbit.ship ?
                        <Flex justifyContent='center' className='w-full '>
                            Completed
                        </Flex>
                        :
                        <Button onClick={() => downloadFile(fileTransfer.url, fileTransfer.fileName)}>Download</Button>
                )
        }
    }


    const acceptFile = (fileTransfer: FileTransfer) => {
        fileTransfer.status = FileTransferStatus.Ongoing;

        urchatStore.updateFileTransfer(fileTransfer)

        fileTransfer.channel.send(JSON.stringify({
            action: 'Accept'
        }))
    }

    const rejectFile = (fileTransfer: FileTransfer) => {
        fileTransfer.status = FileTransferStatus.Rejected;

        urchatStore.updateFileTransfer(fileTransfer);

        fileTransfer.channel.send(JSON.stringify({
            action: 'Reject'
        }))
    }

    const cancelTransfer = (fileTransfer: FileTransfer) => {
        fileTransfer.status = FileTransferStatus.Cancelled

        urchatStore.updateFileTransfer(fileTransfer);

        fileTransfer.channel.send(JSON.stringify({
            action: 'Cancel'
        }))
    }

    return (
        <Card
            style={{ padding: 16 }}
            className='flex flex-col gap-6 w-full'
        >
            <Ship patp={`~${deSig(fileTransfer.owner)}`} />
            <Flex gap={8} justifyContent='center' alignItems='center' width='100%'>
                <MdOutlineInsertDriveFile className="w-6 h-6" />
                <Flex flexDirection='column' style={{ maxWidth: '80%' }} className='items-center w-max-content    '>
                    <Text lineHeight={1} fontWeight='bold'>{fileTransfer.fileName}</Text>
                    <Text lineHeight={1.2}>{formatBytes(fileTransfer.fileSize)}</Text>
                </Flex>
            </Flex>
            {renderByFileStatus(fileTransfer)}
        </Card>

    )
}
