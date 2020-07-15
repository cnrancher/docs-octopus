---
id: ble
title: BLE Adaptor
---

## Introduction

BLE stands for Bluetooth Low Energy (marketed as Bluetooth Smart). BLE is a form of wireless communication designed for short-range communications. 

BLE adaptor implements the Bluetooth protocol and helps to define the attributes of the connected BLE device.

## Registration Information

|  Versions | Register Name | Endpoint Socket | Available |
|:---:|:---:|:---:|:---:|
|  `v1alpha1` | `adaptors.edge.cattle.io/ble` | `ble.sock` | * |

## Support Model

| Kind | Group | Version | Available | 
|:---:|:---:|:---:|:---:|
| `BluetoothDevice` | `devices.edge.cattle.io` | `v1alpha1` | * |

## Support Platform

| OS | Arch |
|:---:|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

## Usage

```shell script
$ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/ble/deploy/e2e/all_in_one.yaml
```

## Authority

Grant permissions to Octopus as below:

```text
  Resources                                   Non-Resource URLs  Resource Names  Verbs
  ---------                                   -----------------  --------------  -----
  bluetoothdevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  bluetoothdevices.devices.edge.cattle.io/status  []                 []              [get patch update]
```

## Example

- Specifies a `BluetoothDevice` device link to connect the [XiaoMi thermometer](https://www.mi.com/mj-humiture).

```YAML
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  name: xiaomi-temp-rs2201
spec:
  adaptor:
    node: edge-worker
    name: adaptors.edge.cattle.io/ble
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "BluetoothDevice"
  template:
    metadata:
      labels:
        device: xiaomi-temp-rs2201
    spec:
      parameters:
        syncInterval: 15s
        timeout: 30s
      protocol:
        endpoint: "MJ_HT_V1"
      properties:
        - name: data
          description: XiaoMi temp sensor with temperature and humidity data
          accessMode: NotifyOnly
          visitor:
            characteristicUUID: 226c000064764566756266734470666d
        - name: humidity
          description: Humidity in percent
          accessMode: ReadOnly
          visitor:
            characteristicUUID: f000aa0304514000b000000000000000
            dataConverter:
              startIndex: 1
              endIndex: 0
              shiftRight: 2
              orderOfOperations:
                # Options are Add/Subtract/Multiply/Divide
                - type: Multiply
                  value: "0.03125"
        - name: power-enabled
          description: Turn the device power on or off
          accessMode: ReadWrite
          visitor:
            characteristicUUID: f000aa0104514000b000000000000001
            # Sets the defaultValue by chosen one of option in the dataWrite
            defaultValue: OFF
            dataWrite:
              ON: [1]
              OFF: [0]
            dataConverter:
              startIndex: 1
              endIndex: 0
              shiftRight: 3
              orderOfOperations:
                - type: Multiply
                  value: "0.03125"
```

For more `BluetoothDevice` device link examples, please refer to the [deploy/e2e](https://github.com/cnrancher/octopus/tree/master/adaptors/ble/deploy/e2e) directory.

## BluetoothDevice

Parameter | Description | Schema | Required
--- | --- | --- | ---
metadata | | [metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | false
spec | Defines the desired state of `BluetoothDevice`. | [BluetoothDeviceSpec](#bluetoothdevicespec) | true
status | Defines the observed state of `BluetoothDevice`. | [BluetoothDeviceStatus](#bluettothdevicestatus) | false

### BluetoothDeviceSpec

Parameter | Description | Scheme | Required
--- | --- | --- | ---
extension | Specifies the extension of device. | *[BluetoothDeviceExtension](#bluetoothdeviceextension) | false
parameters | Specifies the parameters of device. | *[BluetoothDeviceParameters](#bluetoothdeviceparamters) | false
protocol | Specifies the protocol for accessing. the device | [BluetoothDeviceProtocol](#bluetoothdeviceprotocol) | true
properties | Specifies the properties of device. | [[]BluetoothDeviceProperty](#bluetoothdeviceproperty) | false

### BluetoothDeviceStatus

Parameter | Description | Scheme | Required
--- | --- | --- | ---
properties | Reports the properties of device. | [[]BluetoothDeviceStatusProperty](#bluetoothdevicestatusproperty) | false

#### BluetoothDeviceParameters

Parameter | Description | Scheme | Required
--- | --- | --- | ---
syncInterval | Specifies default device sync interval, default to `15s`. | string | false
timeout |  Specifies default device connection timeout, default to `30s`. | string | false

#### BluetoothDeviceProtocol

Parameter | Description | Scheme | Required
--- | --- | --- | ---
endpoint | Specifies the endpoint of device, it can be the name or MAC address of device. | string | true

#### BluetoothDeviceProperty

Parameter | Description | Scheme | Required
--- | --- | --- | ---
name | Specifies the name of property. | string | true
description | Specifies the description of property.  | string | false
accessMode | Specifies the access mode of property, default to `NotifyOnly`. | [BluetoothDevicePropertyAccessMode](#bluetoothpropertyaccessmode) | true
visitor | Specifies the visitor of property. | *[BluetoothDevicePropertyVisitor](#bluetoothpropertyvisitor) | true

#### BluetoothDeviceStatusProperty

Parameter | Description | Scheme | Required
--- | --- | --- | ---
name | Reports the name of property. | string | false
value | Reports the value of property. | string | false
accessMode | Reports the access mode of property. | [BluetoothDevicePropertyAccessMode](#bluetoothpropertyaccessmode) | false
updatedAt | Reports the updated timestamp of property. | *[metav1.Time](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/time.go#L33) | false

#### BluetoothDevicePropertyAccessMode

Parameter | Description | Scheme
--- | --- | --- 
ReadOnly   | Property access mode is read only. | string
ReadWrite  | Property access mode is read and write. | string
NotifyOnly | Property access mode is notify only. | string

#### BluetoothDevicePropertyVisitor

Parameter | Description | Scheme | Required
--- | --- | --- | ---
characteristicUUID | Specifies the characteristic UUID of property. | string | true
defaultValue | Specifies the default value of property, when access mode is `ReadWrite`. | string | false
dataWrite | Specifies the data to write to device. | string | false
dataConverter | Specifies the converter to convert data read from device to a string. | [BluetoothDataConverter](#bluetoothdataconverter) | false

#### BluetoothDataConverter

Parameter | Description | Scheme | Required
--- | --- | --- | ---
startIndex | Specifies the start index of the incoming byte stream to be converted. | int | true
endIndex | Specifies the end index of incoming byte stream to be converted. | int | true
shiftLeft | Specifies the number of bits to shift left. | int | false
shiftRight | Specifies the number of bits to shift right. | int | false
orderOfOperations | Specifies in what order the operations. | [[]BluetoothDeviceArithmeticOperation](#bluetoothdevicearithmeticoperation) | false

#### BluetoothDeviceArithmeticOperation

Parameter | Description | Scheme | Required
--- | --- | --- | ---
type | Specifies the type of arithmetic operation. | [BluetoothDeviceArithmeticOperationType](#bluetoothdevicearithmeticoperationtype) | true
value | Specifies the value for arithmetic operation, which is in form of float string. | string | true

#### BluetoothDeviceArithmeticOperationType

Parameter | Description | Scheme
--- | --- | --- 
Add | Arithmetic operation of add. | string
Subtract | Arithmetic operation of subtract. | string
Multiply | Arithmetic operation of multiply. | string
Divide | Arithmetic operation of divide. | string

#### BluetoothDeviceExtension

Parameter | Description | Scheme | Required
--- | --- | --- | ---
mqtt | Specifies the MQTT settings. | *[v1alpha1.MQTTOptionsSpec](./mqtt-extension#specification) | false
