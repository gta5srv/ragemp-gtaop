import Client from '@lib/client';
Client.instance

import BlipStreamer from '@lib/streamers/blip-streamer';
import './events';

new BlipStreamer();
