(async () => {
  /**
   *
   * @param {*} permissionName string 'microphone' or 'camera'
   * @returns string 'granted' or 'denied' or 'prompt' or 'unknown'
   * https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query
   * https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus/state
   */
  async function checkPermission(permissionName, doSomething) {
    if (!navigator.permissions || !navigator.permissions.query) {
      console.log("Permissions API not supported");
      return;
    }

    try {
      const permissions = await navigator.permissions.query({
        name: permissionName,
      });
      console.log(permissions.state);
      permissions.onchange = (event) => {
        console.log(event.target.state);
        if (doSomething) {
          doSomething(event);
        }
      };
      return permissions.state;
    } catch (err) {
      console.error(`${err.name}: ${err.message}`);
    }
  }

  async function getMedia(constraints) {
    let stream = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Got MediaStream:", stream);
      return stream;
      /* use the stream */
    } catch (err) {
      /* handle the error */
      console.error(`${err.name}: ${err.message}`);
    }
  }

  /**
   *
   * @param {*} type string 'audioinput' or 'videoinput' or 'audiooutput'
   * @returns
   */
  async function getDevices(type) {
    if (!navigator.mediaDevices?.enumerateDevices) {
      throw new Error("enumerateDevices() not supported.");
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log(devices);
      return devices.filter((device) => device.kind === type);
    } catch (err) {
      console.error(`${err.name}: ${err.message}`);
    }
  }

  async function getDevicesList(type) {
    if (type === "video") {
      const cameraPermission = await checkPermission("camera");
      // return
      // if (cameraPermission !== 'granted') {
      //   throw new Error('Camera permission denied')
      // }
    }
    if (type === "audio") {
      const microphonePermission = await checkPermission("microphone");
      // return
      // if (microphonePermission !== 'granted') {
      //   throw new Error('Microphone permission denied')
      // }
    }
    const devices = await getDevices(`${type}input`);
    console.log('devices', devices)
    const devicesList = await Promise.all(
      devices.map(async (element) => {
        const constraints = {};
        constraints[type] = { deviceId: element.deviceId };
        const stream = await getMedia(constraints);
        const capabilities = await stream.getTracks();
        return capabilities.map((track) => track.getCapabilities());
      })
    );
    return devicesList.flat(); // 将嵌套的数组扁平化
  }

  // console.log(await getDevicesList('video'))
  const list = await getDevicesList("video");
  console.log(list);
  document.querySelector("pre").innerText = JSON.stringify(list, null, 2);

  // await getDevicesList('video')

  // getMedia({ audio: true }).then((stream) => {
  //   const capabilities = stream.getTracks()
  //   capabilities.forEach((track) => {
  //     console.log(track.getCapabilities())
  //     document.querySelector('pre').innerText = JSON.stringify(track.getCapabilities(), null, 2)
  //     // console.log(track.getSettings())
  //     // console.log(track.getConstraints())
  //     console.log('------------------')
  //   })
  // })
  // getMedia({ audio: false, video: {
  //   width: { min: 640, ideal: 1280, max: 1920 },
  //   height: { min: 480, ideal: 720, max: 1080 },
  // } }).then((stream) => {
  //   const capabilities = stream.getTracks()
  //   capabilities.forEach((track) => {
  //     console.log(track.getCapabilities())
  //     document.querySelector('pre').innerText = JSON.stringify(track.getCapabilities(), null, 2)
  //     // console.log(track.getSettings())
  //     // console.log(track.getConstraints())
  //     console.log('------------------')
  //   })
  // })

  // await getMedia({ audio: true, video: true })
  // console.log(await getDevices('videoinput'))
  // const devicesInfo = []
  // const devices = await getDevices('audioinput')
  // console.log('devices', devices)
  // devices.forEach(async (element) => {
  //   const stream = await getMedia({ audio: { deviceId: element.deviceId } })
  //   console.log(stream.getTracks())
  //   devicesInfo.push()
  // });
  // console.log(devicesInfo)
})();
