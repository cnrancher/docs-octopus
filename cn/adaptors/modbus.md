---
id: modbus
title: Modbus 适配器
---

### 介绍

[Modbus](https://www.modbustools.com/modbus.html)是主/从协议，请求信息的设备称为Modbus主设备，提供信息的设备为Modbus从设备。
在标准的Modbus网络中，有一个主设备和多达247个从设备，每个从设备具有从1到247的唯一从设备地址。
主机也可以将信息写入从机。

Modbus适配器同时支持TCP和RTU协议，它充当主节点，并可在边缘侧连接或操纵Modbus从设备。

### 注册操作

- **线圈寄存器**：可读可写，1位（关闭/打开）

- **离散输入寄存器**：可读，1位（关闭/打开）

- **输入寄存器**：可读，16位（0至65,535），本质上是测量值和状态

- **保持寄存器**：可读可写，16位（0到65,535），本质上是配置值


### 注册信息

|  Versions | Register Name | Endpoint Socket | Available |
|:---:|:---:|:---:|:---:|
|  `v1alpha1` | `adaptors.edge.cattle.io/modbus` | `modbus.sock` | * |

### 支持模型

| Kind | Group | Version | Available | 
|:---:|:---:|:---:|:---:|
| `ModbusDevice` | `devices.edge.cattle.io` | `v1alpha1` | * |

### 支持平台

| OS | Arch |
|:---:|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

### 使用方式

```shell script
$ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/modbus/deploy/e2e/all_in_one.yaml
```

### 权限

对Octopus授予权限，如下所示：

```text
  Resources                                   Non-Resource URLs  Resource Names  Verbs
  ---------                                   -----------------  --------------  -----
  modbusdevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  modbusdevices.devices.edge.cattle.io/status  []                 []              [get patch update]
```

### Modbus DeviceLink YAML

modbus `DeviceLink` YAML的示例:
```yaml
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  name: modbus-tcp
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
        device: modbus-tcp
    spec:
      protocol:
        tcp:
          ip: 192.168.1.3
          port: 502
          slaveID: 1
      properties:
        - name: temperature
          description: data collection of temperature sensor
          readOnly: false
          visitor:
            register: HoldingRegister
            offset: 2
            quantity: 8
          value: "33.3"
          dataType: float
        - name: temperature-enable
          description: enable data collection of temperature sensor
          readOnly: false
          visitor:
            register: CoilRegister
            offset: 2
            quantity: 1
          value: "true"
          dataType: boolean

```

### Modbus Device Spec

Parameter | Description | Scheme | Required
--- | --- | --- | ---
parameters | Parameter of the modbus device| *[ModbusDeviceParamters](#modbusdeviceparamters) | false
protocol | Protocol for accessing the modbus device  | *[ModbusProtocolConfig](#modbusprotocolconfig) | true
properties | Device properties  | []*[DeviceProperty](#deviceproperty) | false
extension | Integrate with deivce MQTT extension  | *[DeviceExtension](#deviceextension) | false

#### ModbusDeviceParamters

Parameter | Description | Scheme | Required
--- | --- | --- | ---
syncInterval | Device properties sync interval, default to `5s`  | string | false
timeout |  Device connection timeout, default to `10s` | string | false

#### ModbusProtocolConfig

Parameter | Description | Scheme | Required
--- | --- | --- | ---
rtu | Modbus RTU protocol config  | *[ModbusConfigRTU](#modbusconfigrtu)| false
tcp | Modbus TCP protocol config  | *[ModbusConfigTCP](#modbusconfigtcp)| false

#### ModbusConfigRTU

Parameter | Description | Scheme | Required
--- | --- | --- | ---
serialPort | Device path (e.g. /dev/ttyS0) | string | true
slaveId | Slave id of the device | int | true
baudRate | Baud rate, a measurement of transmission speed, default to `19200` | int | false
dataBits | Data bits (5, 6, 7 or 8), default to `0` | int | false
parity | N - None, E - Even, O - Odd (default E) (The use of no parity requires 2 stop bits.) | string | false
stopBits | Stop bits: 1 or 2 (default 1) | int | false

#### ModbusConfigTCP

Parameter | Description | Scheme | Required
--- | --- | --- | ---
ip | IP address of the device | string | true
port | TCP port of the device | int | true
slaveId | Slave id of the device | int | true

#### DeviceProperty

Parameter | Description | Scheme | Required
--- | --- | --- | ---
name | Property name | string | true
description | Property description  | string | false
readOnly | Check if the device property is readonly, default to false | boolean | false
dataType | Property data type, options are `int, string, float, boolean` | string | true
visitor | Property visitor config | *[PropertyVisitor](#propertyvisitor) | true
value | Set desired value of the property | string | false

#### PropertyVisitor

Parameter | Description | Scheme |  Required
--- | --- | --- | ---
register | CoilRegister, DiscreteInputRegister, HoldingRegister, or InputRegister | string | true
offset | Offset indicates the starting register number to read/write data | int | true
quantity | Limit number of registers to read/write | int | true
orderOfOperations | The quantity of registers | []*[ModbusOperations](#modbusoperations) | false

#### ModbusOperations

Parameter | Description | Scheme |  Required
--- | --- | --- | ---
operationType | Arithmetic operation type(`Add, Subtract, Multiply, Divide`) | string | false
operationValue | Arithmetic operation value | string | false

#### DeviceExtension

- 关于Modbus设备的MQTT集成请参考[example YAML](#modbus-devicelink-yaml)。
- 参考[与MQTT文档集成](./mqtt-extension)了解更多详细信息。
