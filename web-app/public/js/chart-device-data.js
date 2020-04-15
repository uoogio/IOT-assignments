/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 50;
      this.timeData = new Array(this.maxLen);
      this.temperatureData = new Array(this.maxLen);
      this.humidityData = new Array(this.maxLen);
      this.wind_directionData = new Array(this.maxLen);
      this.wind_intensityData = new Array(this.maxLen);
      this.rain_heightData = new Array(this.maxLen);

    }

    addData(time, temperature, humidity,wind_direction,wind_intensity,rain_height) {
      this.timeData.push(time);
      this.temperatureData.push(temperature);
      this.humidityData.push(humidity || null);
      this.wind_directionData.push(wind_direction || null);
      this.wind_intensityData.push(wind_intensity || null);
      this.rain_heightData.push(rain_height || null);


      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.temperatureData.shift();
        this.humidityData.shift();
        this.wind_directionData.shift();
        this.wind_intensityData.shift();
        this.rain_heightData.shift();

      }
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

  // Define the chart axes
  const chartData = {
    datasets: [
      {
        fill: false,
        label: 'Temperature',
        yAxisID: 'Temperature',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'Humidity',
        yAxisID: 'Humidity',
        borderColor: 'rgba(24, 120, 240, 1)',
        pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        spanGaps: true,
      },
      {
        fill: false,
      label: 'Wind Direction',
      yAxisID: 'WindDirection',
      borderColor: 'rgba(0, 255, 150, 1)',
      pointBoarderColor: 'rgba(0, 255, 150, 1)',
      backgroundColor: 'rgba(0, 255, 150, 0.4)',
      pointHoverBackgroundColor: 'rgba(0, 255, 150, 1)',
      pointHoverBorderColor: 'rgba(0, 255, 150, 1)',
      spanGaps: true,
      },
      {
        fill: false,
        label: 'Wind Intensity',
        yAxisID: 'WindIntensity',
        borderColor: 'rgba(255, 0, 0, 1)',
        pointBoarderColor: 'rgba(255, 0, 0, 1)',
        backgroundColor: 'rgba(255, 0, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 0, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 0, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
       label: 'Rain Height',
       yAxisID: 'Rain',
       borderColor: 'rgba(200, 0, 200, 1)',
       pointBoarderColor: 'rgba(200, 0, 200, 1)',
       backgroundColor: 'rgba(200, 0, 200, 0.4)',
       pointHoverBackgroundColor: 'rgba(200, 0, 200, 1)',
       pointHoverBorderColor: 'rgba(200, 0, 200, 1)',
       spanGaps: true,
      }
    ]
  };

  const chartOptions = {
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature (ºC)',
          display: true,
        },
        position: 'left',
      },
      {
        id: 'Humidity',
        type: 'linear',
        scaleLabel: {
          labelString: 'Humidity (%)',
          display: true,
        },
        position: 'right',
      },
      {
        id: 'wind_direction',
        type: 'linear',
        scaleLabel: {
          labelString: ' Angles',
          display: true,
        },
        position: 'right',
      },
      {
        id: 'wind_intensity',
        type: 'linear',
        scaleLabel: {
          labelString: 'speed ',
          display: true,
        },
        position: 'right',
      },
      {
        id: 'rain_height',
        type: 'linear',
        scaleLabel: {
          labelString: 'height mm',
          display: true,
        },
        position: 'right',
      }]
    }
  };

  // Get the context of the canvas element we want to select
  const ctx = document.getElementById('iotChart').getContext('2d');
  const myLineChart = new Chart(
    ctx,
    {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });

  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    chartData.labels = device.timeData;
    chartData.datasets[0].data = device.temperatureData;
    chartData.datasets[1].data = device.humidityData;
    chartData.datasets[2].data = device.wind_directionData;
    chartData.datasets[3].data = device.wind_intensityData;
    chartData.datasets[4].data = device.rain_heightData;

  }
  listOfDevices.addEventListener('change', OnSelectionChange, false);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);

      // time and either temperature or humidity are required
      if (!messageData.MessageDate || (!messageData.IotData.temperature && !messageData.IotData.humidity && !messageData.IotData.wind_direction && !messageData.IotData.wind_intensity && !messageData.IotData.rain_height )) {
        return;
      }

      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);

      if (existingDeviceData) {
        existingDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity, messageData.IotData.wind_direction, messageData.IotData.wind_intensity, messageData.IotData.rain_height );
      } else {
        const newDeviceData = new DeviceData(messageData.DeviceId);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
        newDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity, messageData.IotData.wind_direction, messageData.IotData.wind_intensity, messageData.IotData.rain_height);

        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(messageData.DeviceId);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);

        // if this is the first device being discovered, auto-select it
        if (needsAutoSelect) {
          needsAutoSelect = false;
          listOfDevices.selectedIndex = 0;
          OnSelectionChange();
        }
      }

      myLineChart.update();
    } catch (err) {
      console.error(err);
    }
  };
});
