var activeRoom;
var previewTracks;
var identity;
var roomName;

function attachMedia(tracks, container) {
  tracks.map(function(track) {
    return track.attach();
  }).forEach(function(mediaElement) {
    container.appendChild(mediaElement);
  });
}

function attachParticipantMedia(participant, container) {
  Array.from(participant.tracks.values()).map(function(track) {
    return track.attach();
  }).forEach(function(mediaElement) {
    container.appendChild(mediaElement);
  });
}

function detachMedia(tracks) {
  tracks.map(function(track) {
    return track.detach();
  }).forEach(function(mediaElements) {
    mediaElements.forEach(function(mediaElement) {
      mediaElement.remove();
    });
  });
}

function detachParticipantMedia(participant) {
  Array.from(participant.tracks.values()).map(function(track) {
    return track.detach();
  }).forEach(function(mediaElements) {
    mediaElements.forEach(function(mediaElement) {
      mediaElement.remove();
    });
  });
}

// Check for WebRTC
if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
  alert('WebRTC is not available in your browser.');
}

// When we are about to transition away from this page, disconnect
// from the room, if joined.
window.addEventListener('beforeunload', leaveRoomIfJoined);

$.getJSON('/token', function(data) {
  identity = data.identity;

  document.getElementById('room-controls').style.display = 'block';

  // Bind button to join room
  document.getElementById('button-join').onclick = function () {
    roomName = document.getElementById('room-name').value;
    if (roomName) {
      log("Joining room '" + roomName + "'...");

      var connectOptions = { name: roomName, token: data.token };
      if (previewTracks) {
        connectOptions.tracks = previewTracks;
      }

      Twilio.Video.connect(connectOptions).then(roomJoined, function(error) {
        log('Could not connect to Twilio: ' + error.message);
      });
    } else {
      alert('Please enter a room name.');
    }
  };

  // Bind button to leave room
  document.getElementById('button-leave').onclick = function () {
    log('Leaving room...');
    activeRoom.disconnect();
  };
});

// Successfully connected!
function roomJoined(room) {
  activeRoom = room;

  log("Joined as '" + identity + "'");
  document.getElementById('button-join').style.display = 'none';
  document.getElementById('button-leave').style.display = 'inline';

  // Draw local video, if not already previewing
  if (!previewTracks) {
    var previewContainer = document.getElementById('local-media');
    attachParticipantMedia(room.localParticipant, previewContainer);
  }

  room.participants.forEach(function(participant) {
    log("Already in Room: '" + participant.identity + "'");
    var previewContainer = document.getElementById('remote-media');
    attachParticipantMedia(participant, previewContainer);
  });

  // When a participant joins, draw their video on screen
  room.on('participantConnected', function(participant) {
    log("Joining: '" + participant.identity + "'");
  });

  room.on('trackAdded', function(track, participant) {
    log(participant.identity + " added track: " + track.kind);
    var previewContainer = document.getElementById('remote-media');
    attachMedia([track], previewContainer);
  });

  room.on('trackRemoved', function(track, participant) {
    log(participant.identity + " removed track: " + track.kind);
    detachMedia([track]);
  });

  // When a participant disconnects, note in log
  room.on('participantDisconnected', function(participant) {
    log("Participant '" + participant.identity + "' left the room");
    detachParticipantMedia(participant);
  });

  // When we are disconnected, stop capturing local video
  // Also remove media for all remote participants
  room.on('disconnected', function() {
    log('Left');
    detachParticipantMedia(room.localParticipant);
    room.participants.forEach(detachParticipantMedia);
    activeRoom = null;
    document.getElementById('button-join').style.display = 'inline';
    document.getElementById('button-leave').style.display = 'none';
  });
}

//  Local video preview
document.getElementById('button-preview').onclick = function() {
  if (!previewTracks) {
    Twilio.Video.createLocalTracks().then(function(tracks) {
      previewTracks = tracks;
      var previewContainer = document.getElementById('local-media');
      attachMedia(tracks, previewContainer);
    }, function(error) {
      console.error('Unable to access local media', error);
      log('Unable to access Camera and Microphone');
    });
  }
};

// Activity log
function log(message) {
  var logDiv = document.getElementById('log');
  logDiv.innerHTML += '<p>&gt;&nbsp;' + message + '</p>';
  logDiv.scrollTop = logDiv.scrollHeight;
}

function leaveRoomIfJoined() {
  if (activeRoom) {
    activeRoom.disconnect();
  }
}
