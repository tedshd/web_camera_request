/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
 */

/**
 *
 * @param {*} permissionName string 'microphone' or 'camera'
 * @returns string 'granted' or 'denied' or 'prompt' or 'unknown'
 * https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query
 * https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus/state
 */
async function checkPermission(permissionName, doSomething) {
  try {
    const permissions = await navigator.permissions.query({
      name: permissionName,
    });
    // console.log(permissions.state);
    permissions.onchange = (event) => {
      // console.log(event.target.state);
      if (doSomething) {
        doSomething(event);
      }
    };
    return permissions.state;
  } catch (err) {
    throw new Error(`${err.name}: ${err.message}`);
  }
}

/**
 *
 * @param {*} constraints
 * @returns
 * https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Constraints
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 */
async function getMedia(constraints) {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
    /* use the stream */
  } catch (err) {
    /* handle the error */
    throw new Error(`${err.name}: ${err.message}`);
  }
}

/**
 *
 * @param {*} type string 'audioinput' or 'videoinput' or 'audiooutput'
 * @returns array of MediaDeviceInfo
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
 */
async function getDevices(type) {
  if (!navigator.mediaDevices?.enumerateDevices) {
    throw new Error("enumerateDevices() not supported.");
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === type);
  } catch (err) {
    console.error(`${err.name}: ${err.message}`);
  }
}

/**
 *
 * @param {*} type string 'audio' or 'video'
 * @returns {device: MediaDeviceInfo, capabilities: MediaTrackCapabilities}[]
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getCapabilities
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack
 */
async function getDevicesList(type) {
  const devices = await getDevices(`${type}input`);
  const devicesList = await Promise.all(
    devices.map(async (element) => {
      const constraints = {};
      constraints[type] = { deviceId: element.deviceId };
      const stream = await getMedia(constraints);
      const capabilities = await stream.getTracks();
      return capabilities.map((track) => {
        return {
          device: element,
          capabilities: track.getCapabilities(),
        };
      });
    })
  );
  return devicesList.flat();
}