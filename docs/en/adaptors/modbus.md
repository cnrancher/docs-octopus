---
id: modbus
title: Modbus Adaptor
---

## Introduction

[Modbus](https://www.modbustools.com/modbus.html) is a master/slave protocol, the device requesting the information is called the Modbus master and the devices supplying information are Modbus slaves. 
In a standard Modbus network, there is one master and up to 247 slaves, each with a unique slave address from 1 to 247. 
The master can also write information to the slaves.

Modbus adaptor implements the [goburrow/modbus](#github.com/goburrow/modbus) to support both TCP and RTU protocols, it acting as the controller(master) node and connects to or manipulating the Modbus worker(slave) devices on the edge side.

### Modbus Registers Operation

- **Coil Registers**: readable and writable, 1 bit (off/on)

- **Discrete Input Registers**: readable, 1 bit (off/on)

- **Input Registers**: readable, 16 bits (0 to 65,535), essentially measurements and statuses

- **Holding Registers**: readable and writable, 16 bits (0 to 65,535), essentially configuration values

## Registration Information

|  Versions | Register Name | Endpoint Socket | Available |
|:---:|:---:|:---:|:---:|
|  `v1alpha1` | `adaptors.edge.cattle.io/modbus` | `modbus.sock` | * |

## Support Model

| Kind | Group | Version | Available | 
|:---:|:---:|:---:|:---:|
| `ModbusDevice` | `devices.edge.cattle.io` | `v1alpha1` | * |

## Support Platform

| OS | Arch |
|:---:|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

## Usage

```shell script
$ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/modbus/deploy/e2e/all_in_one.yaml
```

## Authority

Grant permissions to Octopus as below:

```text
  Resources                                   Non-Resource URLs  Resource Names  Verbs
  ---------                                   -----------------  --------------  -----
  modbusdevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  modbusdevices.devices.edge.cattle.io/status  []                 []              [get patch update]
```

## Example

- Specifies a `ModbusDevice` device link to connect a serial port thermometer.

    ```yaml
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      name: modbus-rtu
    spec:
      adaptor:
        node: edge-worker
        name: adaptors.edge.cattle.io/modbus
      model:
        apiVersion: "devices.edge.cattle.io/v1alpha1"
        kind: "ModbusDevice"
      template:
        metadata:
          labels:
            device: modbus-rtu
        spec:
          parameters:
            syncInterval: 10s
            timeout: 10s
          protocol:
            rtu:
              endpoint: /dev/tty.usbserial-1410
              workerID: 1
              parity: "N"
              stopBits: 2
              dataBits: 8
              baudRate: 9600
          properties:
            - name: temperature
              description: data collection of temperature sensor
              readOnly: true
              visitor:
                register: HoldingRegister
                offset: 0
                quantity: 1
                orderOfOperations:
                  - type: Divide
                    value: "10"
              type: float
    ```

For more `ModbusDevice` device link examples, please refer to the [deploy/e2e](https://github.com/cnrancher/octopus/tree/master/adaptors/modbus/deploy/e2e) directory.

## ModbusDevice

Parameter | Description | Schema | Required
--- | --- | --- | ---
metadata | | [metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | false
spec | Defines the desired state of `ModbusDevice`. | [ModbusDeviceSpec](#modbusdevicespec) | true
status | Defines the observed state of `ModbusDevice`. | [ModbusDeviceStatus](#modbusdevicestatus) | false

### ModbusDeviceSpec

Parameter | Description | Scheme | Required
--- | --- | --- | ---
extension | Specifies the extension of device. | *[ModbusDeviceExtension](#modbusdeviceextension) | false
parameters | Specifies the parameters of device. | *[ModbusDeviceParameters](#modbusdeviceparameters) | false
protocol | Specifies the protocol for accessing the device. | *[ModbusDeviceProtocol](#modbusdeviceprotocol) | true
properties | Specifies the properties of device. | [[]ModbusDeviceProperty](#modbusdeviceproperty) | false

### ModbusDeviceStatus

Parameter | Description | Scheme | Required
--- | --- | --- | ---
properties | Reports the properties of device. | [[]ModbusDeviceStatusProperty](#modbusdevicestatusproperty) | false

#### ModbusDeviceParameters

Parameter | Description | Scheme | Required
--- | --- | --- | ---
syncInterval | Specifies the amount of interval that synchronized to limb, default to `15s`. | string | false
timeout | Specifies the amount of timeout, default to `10s`. | string | false

#### ModbusDeviceProtocol

Parameter | Description | Scheme | Required
--- | --- | --- | ---
rtu | Specifies the connection protocol as RTU. | *[ModbusDeviceProtocolRTU](#modbusdeviceprotocolrtu)| false
tcp |  Specifies the connection protocol as TCP. | *[ModbusDeviceProtocolTCP](#modbusdeviceprotocoltcp)| false

#### ModbusDeviceProtocolRTU

Parameter | Description | Scheme | Required
--- | --- | --- | ---
endpoint | Specifies the serial port of device, which is in form of "/dev/ttyS0". | string | true
workerID | Specifies the worker ID of device. | int | true
baudRate | Specifies the baud rate of connection, a measurement of transmission speed, default to `19200`. | int | false
dataBits | Specifies the data bit of connection, selected from [5, 6, 7, 8], default to `8`. | int | false
parity   | Specifies the parity of connection, selected from [`N` - None, `E` - Even, `O` - Odd], the use of N(None) parity requires 2 stop bits, default to `E`. | string | false
stopBits | Specifies the stop bit of connection, selected from [1, 2],the use of N(None) parity requires 2 stop bits, default to `1`. | int | false

#### ModbusDeviceProtocolTCP

Parameter | Description | Scheme | Required
--- | --- | --- | ---
endpoint | Specifies the IP address of device, which is in form of "ip:port". | string | true
workerID | Specifies the worker ID of device. | int | true

#### ModbusDeviceProperty

Parameter | Description | Scheme | Required
--- | --- | --- | ---
name | Specifies the name of property. | string | true
description | Specifies the description of property. | string | false
type | Specifies the type of property. | [ModbusDevicePropertyType](#modbusdevicepropertytype) | true
visitor | Specifies the visitor of property. | *[ModbusDevicePropertyVisitor](#modbusdevicepropertyvisitor) | true
readOnly | Specifies if the property is readonly., default to `false`. | boolean | false
value | Specifies the value of property, only available in the writable property. | string | false

#### ModbusDeviceStatusProperty

Parameter | Description | Scheme | Required
--- | --- | --- | ---
name | Reports the name of property. | string | false
type | Reports the type of property. | [ModbusDevicePropertyType](#modbusdevicepropertytype) | false
value | Reports the value of property. | string | false
updatedAt | Reports the updated timestamp of property. | *[metav1.Time](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/time.go#L33) | false

#### ModbusDevicePropertyType

Parameter | Description | Scheme
--- | --- | ---
string | Property data type is string. | string 
int | Property data type is int. | string  
float | Property data type is float. | string  
boolean | Property data type is boolean. | string 

#### ModbusDevicePropertyVisitor

Parameter | Description | Scheme |  Required
--- | --- | --- | ---
register | Specifies the register to visit. | [ModbusDeviceRegisterType](#modbusdeviceregistertype) | true
offset | Specifies the starting offset of register for read/write data. | int | true
quantity | Specifies the quantity of register. | int | true
orderOfOperations | Specifies the operations in order if needed. | [[]ModbusDeviceArithmeticOperation](#modbusdevicearithmeticoperation) | false

#### ModbusDeviceRegisterType

Parameter | Description | Scheme
--- | --- | --- 
CoilRegister | Readable and writable, 1 bit (off/on). | string  
DiscreteInputRegister | Readonly, 1 bit (off/on). | string  
InputRegister | Readonly, 16 bits (0 to 65,535), essentially measurements and statuses. | string  
HoldingRegister | Readable and writable, 16 bits (0 to 65,535), essentially configuration values. | string 

#### ModbusDeviceArithmeticOperation

Parameter | Description | Scheme | Required
--- | --- | --- | ---
type | Specifies the type of arithmetic operation. | [ModbusDeviceArithmeticOperationType](#modbusdevicearithmeticoperationtype) | false
value | Specifies the value for arithmetic operation, which is in form of float string. | string | false

#### ModbusDeviceArithmeticOperationType

Parameter | Description | Scheme 
--- | --- | ---
Add | Arithmetic operation of add. | string
Subtract | Arithmetic operation of subtract. | string 
Multiply | Arithmetic operation of multiply. | string 
Divide | Arithmetic operation of divide. | string 

#### ModbusDeviceExtension

Parameter | Description | Scheme | Required
--- | --- | --- | ---
mqtt | Specifies the MQTT settings. | *[v1alpha1.MQTTOptionsSpec](./mqtt-extension#specification) | false
