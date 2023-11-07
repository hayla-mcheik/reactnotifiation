
//pusher.js

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'c92de035c19a321f7907',
    cluster: 'ap2',
    forceTLS: true,
    encrypted: true, // Set to true if your server uses HTTPS
});
