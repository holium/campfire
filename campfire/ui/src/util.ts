export const useMock = import.meta.env.MODE === 'mock';

const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export const formatBytes = (x) => {

    let l = 0, n = parseInt(x, 10) || 0;

    while (n >= 1024 && ++l) {
        n = n / 1024;
    }

    return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

export const downloadFile = (url, fileName) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    a.remove()
};

export const createBlob = (receivedBuffers, totalBytesArrayBuffers, fileType) => {
    let offset = 0;
    const uintArrayBuffer = new Uint8Array(totalBytesArrayBuffers, 0);

    receivedBuffers.forEach((arrayBuffer) => {
        uintArrayBuffer.set(
            new Uint8Array(arrayBuffer.buffer || arrayBuffer, arrayBuffer.byteOffset),
            offset
        );
        offset += arrayBuffer.byteLength;
    });

    const blob = new Blob([uintArrayBuffer], { type: fileType });

    return blob;
}
