import nextTick from 'next-tick';
import { BroadcastChannel as BC } from 'broadcast-channel';

const ROOT_CHANNEL_NAME = 'microfe:eventbus';

class BroadcastChannel {
  constructor(channel = ROOT_CHANNEL_NAME) {
    this.bus = new BC(channel);
  }

  postMessage(...args) {
    nextTick(() => {
      this.bus.postMessage.apply(this.bus, args);
    });
  }

  close(...args) {
    return this.bus.close.apply(this.bus, args);
  }

  set onmessage(val) {
    this.bus.onmessage = val;
  }

  set onmessageerror(val) {
    this.bus.onmessageerror = val;
  }
}

export default BroadcastChannel;
