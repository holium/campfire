
import React, { useEffect, useRef, useState } from "react";
import { useStore } from "../stores/root";
import { Button, Flex, Text, Card, } from "@holium/design-system";
import { FileTransferStatus, UrchatStore } from "../stores/urchat";
import { createBlob, formatBytes, } from "../util";
import { MdUploadFile } from "react-icons/md";
import { observer } from "mobx-react";
import { SharedFile } from "./SharedFile";

export const MAXIMUM_MESSAGE_SIZE = 65535;
export const BUFFER_THRESHOLD = 65535;
export const END_OF_FILE_MESSAGE = 'EOF';
export const SHAREFILE_CHANNEL_LABEL = 'file-transfer';

export const handleIncomingFileTransfer = (channel: RTCDataChannel, urchatStore: UrchatStore) => {

    channel.binaryType = 'arraybuffer';

    let receivedBuffers: any[] = [];
    let totalReceivedBytes = 0;
    let fileSize = 0;

    channel.onmessage = (event) => {
        const { data } = event;

        try {
            if (data.byteLength) { // is piece of data
                totalReceivedBytes += data.byteLength;

                // updates progress
                const fileTransfer = urchatStore.getFileTransferByChannelLabel(channel.label);
                fileTransfer.progress = Math.trunc((totalReceivedBytes) / (fileSize / 100));
                urchatStore.updateFileTransfer(fileTransfer);

                receivedBuffers.push(data);
            }
            else if (data == END_OF_FILE_MESSAGE) {  // is end of file
                const fileTransfer = urchatStore.getFileTransferByChannelLabel(channel.label);
                const blob = createBlob(receivedBuffers, totalReceivedBytes, fileTransfer.fileType);
                fileTransfer.url = window.URL.createObjectURL(blob);
                fileTransfer.status = FileTransferStatus.Completed;
                fileTransfer.progress == 100;

                urchatStore.updateFileTransfer(fileTransfer);

                receivedBuffers = [];
                totalReceivedBytes = 0;
                fileSize = 0;

                channel.close();
            }
            else {  // other side is sending the file info? 

                const object = JSON.parse(data);

                if (object.action == 'Request') {

                    urchatStore.setIncomingFileTransfer(true); // opens the file transfer dialog

                    urchatStore.setNewFileTransfer({
                        owner: urchatStore.ongoingCall.call.peer,
                        receiver: urchatStore.urbit.ship,
                        status: FileTransferStatus.Waiting,
                        fileName: object.fileName,
                        fileSize: object.fileSize,
                        fileType: object.fileType,
                        channel: channel,
                        url: null,
                        progress: 0
                    });

                    fileSize = object.fileSize;
                    totalReceivedBytes = 0;

                }
                else if (object.action == 'Cancel') {
                    const fileTransfer = urchatStore.getFileTransferByChannelLabel(channel.label);
                    fileTransfer.status = FileTransferStatus.Cancelled;
                    urchatStore.updateFileTransfer(fileTransfer);
                    channel.close();
                }
            }
        } catch (err) {
            console.log(err)
        }
    };
}

export const isFileTransferChannel = (label: string) => {
    return label.includes(SHAREFILE_CHANNEL_LABEL) ? true : false;
}

enum TabOptions {
    Share, Files
}

export const ShareFileDialog = observer(() => {
    const { urchatStore } = useStore();
    const inputRef = useRef<HTMLInputElement>();
    const [files, setFiles] = useState<FileList>();
    const [tabOpen, setTabOpen] = useState<TabOptions>(TabOptions.Share);

    useEffect(() => {
        urchatStore.incomingFileTransfer && setTabOpen(TabOptions.Files);
    }, []);

    const handleShareClick = async () => {

        if (!files || files.length == 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            await urchatStore.startFileTransfer((call) => {

                const channel = call.conn.createDataChannel(SHAREFILE_CHANNEL_LABEL + '-' + urchatStore.ongoingCall.call.peer + '-' + (urchatStore.fileTransfers.length + i));
                channel.binaryType = "arraybuffer";

                channel.onopen = async () => {
                    const blob = new Blob([file], { type: file.type });

                    urchatStore.setNewFileTransfer({
                        owner: urchatStore.urbit.ship,
                        receiver: urchatStore.ongoingCall.call.peer,
                        status: FileTransferStatus.Waiting,
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        channel: channel,
                        url: window.URL.createObjectURL(blob),
                        progress: 0,
                    });

                    // Send the file info to the other side
                    channel.send(
                        JSON.stringify({
                            action: 'Request',
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type
                        })
                    );

                }

                channel.onmessage = async (evt) => {
                    const { data } = evt;

                    try {
                        const object = JSON.parse(data);
                        if (object.action == 'Accept') { // other side has accepted
                            const fileTransfer = urchatStore.getFileTransferByChannelLabel(channel.label);
                            fileTransfer.status = FileTransferStatus.Ongoing;

                            urchatStore.updateFileTransfer(fileTransfer);

                            const arrayBuffer = await file.arrayBuffer();

                            let paused = false;
                            const queue: any[] = [];
                            let totalBytesSent = 0;
                            let hasCancelled = false;

                            const sendWithQueue = (data) => {
                                queue.push(data);

                                if (paused) {
                                    return;
                                }

                                shiftQueue();
                            }

                            const shiftQueue = () => {
                                paused = false;
                                let message = queue.shift();

                                while (message && !hasCancelled) {
                                    if (channel.bufferedAmount && channel.bufferedAmount > BUFFER_THRESHOLD) {
                                        paused = true;
                                        queue.unshift(message);

                                        const listener = () => {
                                            channel.removeEventListener("bufferedamountlow", listener);
                                            shiftQueue();
                                        };

                                        channel.addEventListener("bufferedamountlow", listener);
                                        return;
                                    }

                                    try {
                                        if (message.byteLength) {
                                            totalBytesSent += message.byteLength;
                                        }

                                        const fileTransfer = urchatStore.getFileTransferByChannelLabel(channel.label);

                                        if (fileTransfer.status !== FileTransferStatus.Cancelled) {
                                            fileTransfer.progress = Math.trunc((totalBytesSent) / (fileTransfer.fileSize / 100));

                                            if (message === END_OF_FILE_MESSAGE) {
                                                fileTransfer.status = FileTransferStatus.Completed;
                                            }

                                            urchatStore.updateFileTransfer(fileTransfer);

                                            channel.send(message);
                                            message = queue.shift();
                                        }
                                        else {
                                            hasCancelled = true;
                                        }
                                    } catch (error) {
                                        console.log(error)
                                    }
                                }
                            }

                            for (let i = 0; i < arrayBuffer.byteLength; i += MAXIMUM_MESSAGE_SIZE) {
                                sendWithQueue(arrayBuffer.slice(i, i + MAXIMUM_MESSAGE_SIZE));
                            }

                            sendWithQueue(END_OF_FILE_MESSAGE);

                        }
                        else if (object.action === 'Reject') {
                            const fileTransfer = urchatStore.getFileTransferByChannelLabel(channel.label);
                            fileTransfer.status = FileTransferStatus.Rejected;
                            urchatStore.updateFileTransfer(fileTransfer);

                            channel.close();
                        }
                        else if (object.action === 'Cancel') {
                            const fileTransfer = urchatStore.getFileTransferByChannelLabel(channel.label);
                            fileTransfer.status = FileTransferStatus.Cancelled;
                            urchatStore.updateFileTransfer(fileTransfer);

                            channel.close();
                        }
                    }
                    catch (err) {
                        channel.close();
                    }
                }

            });

        }


        if (inputRef.current) {
            inputRef.current.value = '';
        }
        setFiles(undefined);
        setTabOpen(TabOptions.Files)
    }

    return (
        <div className="overflow-hidden rounded-xl ">
            <Flex className="h-min relative px-8"
                flexDirection='column'
                gap={16}
                style={{
                    width: '500px',
                    minHeight: '500px',
                    maxHeight: 'min(80vh, 800px)',
                    maxWidth: 'min(500px, 100vw)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
            >
                <Flex className='w-full sticky py-4 pb-2 z-10 top-0 baseColor' justifyContent='center' alignItems='center'>
                    <Card>
                        <Button className='whitespace-nowrap' variant={tabOpen == TabOptions.Share ? 'primary' : 'secondary'}
                            onClick={() => setTabOpen(TabOptions.Share)}
                            style={{ width: '130px' }}
                        >
                            Share Files
                        </Button>
                        <Button className='whitespace-nowrap' variant={tabOpen == TabOptions.Share ? 'secondary' : 'primary'}
                            onClick={() => setTabOpen(TabOptions.Files)}
                            style={{ width: '130px' }}
                        >
                            All Files
                        </Button>
                    </Card>
                </Flex>
                {tabOpen === TabOptions.Share ?
                    <Flex flexDirection='column' className=' w-full h-full' gap={16}>
                        <div style={{ borderRadius: '8px' }} className={` ${!(files === undefined || files.length === 0) && 'default-ring-always'}`}>
                            <Card>
                                <Flex flexDirection='column'
                                    className='w-full h-full relative py-14'
                                    justifyContent='center'
                                    alignItems='center'
                                >
                                    {
                                        (files === undefined || files.length === 0) &&
                                        <>
                                            <Text >Drop files here</Text>
                                            <Text >or</Text>
                                            <Text fontWeight='medium'>Click to browse</Text>
                                        </>

                                    }
                                    {
                                        files && files.length === 1 &&
                                        <>
                                            <MdUploadFile className="w-8 h-8 mb-2" style={{ color: 'var(--rlm-icon-color, #000000)', opacity: '0.5', fontSize: '20px' }} aria-hidden />
                                            <Text lineHeight={1} fontWeight='bold' textAlign={"center"}>{files.item(0).name}</Text>
                                            <Text lineHeight={1.2} textAlign={"center"}>{formatBytes(files.item(0).size)}</Text>
                                        </>
                                    }
                                    {
                                        files && files.length > 1 &&
                                        <>
                                            <MdUploadFile className="w-8 h-8 mb-2" style={{ color: 'var(--rlm-icon-color, #000000)', opacity: '0.5', fontSize: '20px' }} aria-hidden />
                                            <Text lineHeight={1} fontWeight='bold'>{files.length + ' files selected'}</Text>
                                        </>
                                    }
                                    <input ref={inputRef} type="file" className="w-full h-full absolute cursor-pointer opacity-0 top-0 left-0 focus:outline-none" onChange={(e) => { e.target.files && setFiles(e.target.files) }} multiple />
                                </Flex>
                            </Card>
                        </div>
                        {(files && files.length > 0) &&
                            <Flex justifyContent='space-between' className='w-full'>
                                <Button onClick={() => setFiles(undefined)} style={{ width: 'calc(50% - 8px)', backgroundColor: '#DEDEDE', color: 'black' }}>Remove</Button>
                                <Button onClick={handleShareClick} style={{ width: 'calc(50% - 8px)' }}>Send</Button>
                            </Flex>}
                    </Flex>
                    :
                    <Flex flexDirection='column' gap={16} className='mb-4'>
                        {(urchatStore.fileTransfers === undefined || urchatStore.fileTransfers.length == 0)
                            ?
                            <Text opacity={0.7} fontSize={3} textAlign={"center"} marginTop={'140px'}>
                                No shared files yet
                            </Text>
                            :
                            urchatStore.fileTransfers.map((fileTransfer) => {
                                return (
                                    <SharedFile fileTransfer={fileTransfer} key={fileTransfer.channel.label} />
                                )
                            })}
                    </Flex>
                }
            </Flex>
        </div>
    )
});