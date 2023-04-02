import {
  UrbitRTCApp,
  UrbitRTCIncomingCallEvent,
  UrbitRTCPeerConnection,
} from "rtcswitchboard";
import Icepond from "icepond";
import Urbit from "@urbit/http-api";
import { action, makeObservable, observable, runInAction } from "mobx";

const dap = "campfire";

export type Call = {
  peer: string;
  dap: string;
  uuid: string;
};

export interface OngoingCall {
  conn: UrbitRTCPeerConnection;
  call: Call;
}

export interface Message {
  speaker: string;
  message: string;
}

export type FileTransferStatus = 'Waiting' | 'Ongoing' | 'Rejected' | 'Completed' | 'Errored' | 'Cancelled';

export interface FileTransfer {
  owner: string;
  receiver: string;
  fileName: string,
  fileSize: number,
  fileType: string,
  status: FileTransferStatus,
  channel: RTCDataChannel,
  url: string;
  progress: number;
}

interface IUrchatStore {
  urbit: Urbit | null;
  urbitRtcApp: UrbitRTCApp;
  icepond: Icepond;
  configuration: RTCConfiguration;
  incomingCall: UrbitRTCIncomingCallEvent;
  incomingFileTransfer: boolean;
  fileTransfers: FileTransfer[];
  updateFileTransfer: (fileTransfer: FileTransfer) => void;
  setFileTransfers: (fileTransfers: FileTransfer[]) => void;
  setNewFileTransfer: (fileTransfer: FileTransfer) => void;
  ongoingCall: OngoingCall;
  dataChannel: RTCDataChannel;
  dataChannelOpen: boolean;
  isCaller: boolean;
  messages: Message[];
  wasHungUp: boolean;
  setUrbit: (ur: Urbit) => void;
  setDataChannelOpen: (value: boolean) => void;
  startIcepond: () => void;
  placeCall: (
    ship: string,
    setHandlers: (call: OngoingCall) => void
  ) => Promise<void>;
  answerCall: (
    setHandlers: (ship: string, conn: UrbitRTCPeerConnection) => void
  ) => Promise<OngoingCall>;
  rejectCall: () => void;
  hangup: () => void;
  hungup: () => void;
  makeFalseWasHungUp: () => void;
  setMessages: (new_mesages: Message[]) => void;
  clearFileTransfers: () => void;
}

export class UrchatStore implements IUrchatStore {
  urbit: Urbit | null;
  urbitRtcApp: UrbitRTCApp;
  icepond: Icepond;
  configuration: RTCConfiguration;
  incomingCall: UrbitRTCIncomingCallEvent;
  incomingFileTransfer: boolean;
  fileTransfers: FileTransfer[];
  ongoingCall: OngoingCall;
  dataChannel: RTCDataChannel;
  dataChannelOpen: boolean;
  isCaller: boolean;
  messages: Message[];
  connectionState: string;
  wasHungUp: boolean;

  constructor() {
    this.configuration = { iceServers: [] };
    console.log("make constructor");
    this.urbit = new Urbit("", "");
    // requires <script> tag for /~landscape/js/session.js
    this.urbit.ship = (window as Window & typeof globalThis & { ship: string }).ship;
    this.urbit.verbose = true;
    this.urbitRtcApp = new UrbitRTCApp(dap, this.configuration);
    this.urbitRtcApp.addEventListener(
      "incomingcall",
      (evt: UrbitRTCIncomingCallEvent) => {
        this.handleIncomingCall(evt);
      }
    );
    this.urbitRtcApp.urbit = this.urbit;
    this.icepond = null;
    this.ongoingCall = null;
    this.incomingCall = null;
    this.isCaller = false;
    this.dataChannel = null;
    this.dataChannelOpen = false;
    this.messages = [];
    this.fileTransfers = [];
    this.incomingFileTransfer = false;
    this.connectionState = null;
    this.wasHungUp = false;

    makeObservable(this, {
      configuration: observable,
      urbitRtcApp: observable,
      urbit: observable,
      icepond: observable,
      ongoingCall: observable,
      incomingCall: observable,
      incomingFileTransfer: observable,
      isCaller: observable,
      dataChannelOpen: observable,
      messages: observable,
      connectionState: observable,
      wasHungUp: observable,
      fileTransfers: observable,
      setUrbit: action.bound,
      handleIncomingCall: action.bound,
      setDataChannel: action.bound,
      setDataChannelOpen: action.bound,
      startFileTransfer: action.bound,
      startIcepond: action.bound,
      placeCall: action.bound,
      answerCall: action.bound,
      reconnectCall: action.bound,
      rejectCall: action.bound,
      hangup: action.bound,
      hungup: action.bound,
      makeFalseWasHungUp: action.bound,
      setMessages: action.bound,
      setNewFileTransfer: action.bound,
      setFileTransfers: action.bound,
      updateFileTransfer: action.bound,
      setIncomingFileTransfer: action.bound,
      clearFileTransfers: action.bound
    });
  }

  setUrbit(urbit: Urbit) {
    console.log("setting urbit state variable");
    const instance = urbit;
    this.urbitRtcApp.urbit = instance;
    this.urbit = instance;
  }

  handleIncomingCall(incomingCallEvt: UrbitRTCIncomingCallEvent) {
    if (this.incomingCall === null) {
      this.incomingCall = incomingCallEvt;
    } else {
      incomingCallEvt.reject();
    }
  }

  setDataChannel(value: RTCDataChannel) {
    if (this.urbit.verbose) {
      console.log("setting data channel");
      console.log(value);
    }
    this.dataChannel = value;
  }
  setDataChannelOpen(value: boolean) {
    this.dataChannelOpen = value;
  }

  setIncomingFileTransfer(value: boolean) {
    runInAction(() => {
      this.incomingFileTransfer = value;
    });
  }

  async startFileTransfer(setHandlers: (call: OngoingCall) => void) {
    setHandlers(this.ongoingCall)
  }

  startIcepond() {
    const icepond = new Icepond(this.urbit);
    // on start
    icepond.oniceserver = (evt) => {
      console.log("just got a server");
      const newConfig = {
        ...this.configuration,
        iceServers: evt.iceServers,
      };
      if (this.urbitRtcApp !== null) {
        this.urbitRtcApp.configuration = newConfig;
      }
      if (this.incomingCall !== null) {
        this.incomingCall.configuration = newConfig;
      }
      if (this.ongoingCall !== null) {
        this.ongoingCall.conn.setConfiguration(newConfig);
      }
      this.configuration = newConfig;
    };
    icepond.initialize();
    this.icepond = icepond;
  }

  async placeCall(ship: string, setHandlers: (call: OngoingCall) => void) {
    const { urbitRtcApp, hungup, startIcepond } = this;
    const conn = urbitRtcApp.call(ship, dap);
    conn.addEventListener("hungupcall", hungup);
    conn.onurbitstatechanged = (_ev: Event) => {
      runInAction(() => {
        this.connectionState = conn.urbitState;
      });
    };
    conn.onring = (_uuid: string) => {
      runInAction(() => {
        const call = { peer: ship, dap: dap, uuid: conn.uuid };
        const ongoingCall = { conn, call };
        this.ongoingCall = ongoingCall;
      });
      setHandlers(this.ongoingCall);
    };
    await conn.initialize();
    startIcepond();
    runInAction(() => {
      this.wasHungUp = false;
      this.isCaller = true;
    });
  }

  async answerCall(
    setHandlers: (ship: string, conn: UrbitRTCPeerConnection) => void
  ) {
    console.log("trying to answer call");
    const { incomingCall, hungup, startIcepond } = this;
    const call = incomingCall.call;
    const conn = incomingCall.answer();
    conn.addEventListener("hungupcall", hungup);
    conn.onurbitstatechanged = (_ev: Event) => {
      runInAction(() => {
        this.connectionState = conn.urbitState;
      });
    };
    setHandlers(call.peer, conn);
    await conn.initialize();
    startIcepond();

    const ongoingCall = { conn, call };
    runInAction(() => {
      this.wasHungUp = false;
      this.isCaller = false;
      this.ongoingCall = ongoingCall;
      this.incomingCall = null;
    });

    return ongoingCall;
  }

  async reconnectCall(uuid, setHandlers) {
    const urbit = this.urbit;
    const conn = await UrbitRTCPeerConnection.reconnect({ urbit, uuid });
    const call = { uuid, peer: conn.peer, dap: conn.dap };
    const ongoingCall = { call, conn };

    const { hungup, startIcepond } = this;
    conn.addEventListener("hungupcall", hungup);
    setHandlers(call.peer, conn);
    await conn.initialize();
    startIcepond();

    this.ongoingCall = ongoingCall;
    return ongoingCall;
  }

  rejectCall() {
    this.incomingCall.reject();
    this.incomingCall = null;
  }
  hangup() {
    if (this.ongoingCall) {
      this.ongoingCall.conn.close();
    }
    this.ongoingCall = null;
  }
  hungup() {
    console.log("someone hung up on us");
    this.ongoingCall = null;
    this.dataChannelOpen = false;
    this.wasHungUp = true;
  }

  makeFalseWasHungUp() {
    this.wasHungUp = false;
  }

  setMessages(new_messages: Message[]) {
    console.log("setting messages to: " + new_messages);
    this.messages = new_messages;
  }

  setFileTransfers(fileTransfers: FileTransfer[]) {
    this.fileTransfers = fileTransfers;
  }

  setNewFileTransfer(fileTransfer: FileTransfer) {
    this.fileTransfers = [fileTransfer].concat(this.fileTransfers);
  }

  getFileTransferByChannelLabel(label: string) {
    return this.fileTransfers.filter(fileTransfer => fileTransfer.channel.label === label)[0];
  }

  updateFileTransfer(fileTransfer: FileTransfer) {
    this.fileTransfers = this.fileTransfers.map(obj => obj.channel.label === fileTransfer.channel.label ? fileTransfer : obj);
  }

  clearFileTransfers() {
    this.fileTransfers.forEach(x => {
      window.URL.revokeObjectURL(x.url)
    })

    this.fileTransfers = [];
  }

}
