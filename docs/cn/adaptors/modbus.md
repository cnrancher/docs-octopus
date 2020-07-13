---
id: modbus
title: Modbus 适配器
---

### 介绍

[Modbus](https://www.modbustools.com/modbus.html)是主/从协议，请求信息的设备称为**Modbus主设备**，提供信息的设备称为**Modbus从设备**。
在标准的Modbus网络中，有1个主设备和最多247个从设备，每个从设备具有从1到247的唯一从设备地址。
除了请求从设备的信息外，主设备也可以将信息写入从设备。

Modbus适配器同时支持TCP和RTU协议充当主节点，并可在边缘侧连接或操纵Modbus从设备。

### 注册操作

- **线圈寄存器**：即CoilRegister，可读可写，1位（关闭/打开）

- **离散输入寄存器**：即DiscreteInputRegister，可读，1位（关闭/打开）

- **输入寄存器**：即HoldingRegister，可读，16位（0至65，535），本质上是测量值和状态

- **保持寄存器**：即InputRegister，可读可写，16位（0到65，535），本质上是配置值


### 注册信息

|  版本 | 注册名称 | 端点 Socket | 是否可用 |
|:---|:---|:---|:---|
|  `v1alpha1` | `adaptors.edge.cattle.io/modbus` | `modbus.sock` | 是 |

### 支持模型

| 类型 | 设备组 | 版本 | 是否可用 | 
|:---|:---|:---|:---|
| `ModbusDevice` | `devices.edge.cattle.io` | `v1alpha1` | 是 |

### 支持平台

| 操作系统 | 架构 |
|:---|:---|
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

### Modbus DeviceLink YAML示例

modbus `DeviceLink` YAML的示例：
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

### Modbus Device 参数说明 

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
parameters | Modbus设备的参数| *[ModbusDeviceParamters](#modbusdeviceparamters) | 否
protocol | 访问Modbus设备的网络传输协议  | *[ModbusProtocolConfig](#modbusprotocolconfig) | 是
properties | Modbus设备属性  | *[DeviceProperty](#deviceproperty) | 否
extension | Modbus设备的MQTT集成  | *[DeviceExtension](#deviceextension) | 否

#### ModbusDeviceParamters

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
syncInterval | 同步设备属性的间隔时间，默认值为5秒  | string | 否
timeout |  设备连接超时时间，默认值为10秒          | string | 否

#### ModbusProtocolConfig

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
rtu | Modbus RTU传输协议相关参数  | *[ModbusConfigRTU](#modbusconfigrtu)| 否
tcp | Modbus TCP传输协议相关参数  | *[ModbusConfigTCP](#modbusconfigtcp)| 否

#### ModbusConfigRTU

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
serialPort | 设备路径（例如：/dev/ttyS0） | string | 是
slaveId | 从设备ID | int | 是
baudRate | 波特率，传输速度的测量单位, 默认值是`19200` | int | 否
dataBits | 数据位 （5、6、7或8） 默认值是`0` | int | 否
parity | 奇偶校验，N - 无校验；E -偶数校验；O - 奇数校验；默认值为E  | string | 否
stopBits | 停止位数， 可选值：1或2，默认值为1 | int | 否

#### ModbusConfigTCP

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
ip | 设备的IP地址 | string | 是
port | 设备使用的IP端口 | int | 是
slaveId | 设备使用的从设备ID | int | 是

#### DeviceProperty

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
name | 属性名称 | string | 是
description | 属性描述  | string | 否
readOnly | 是否只读，默认值为`false` | boolean | 否
dataType | 属性的数据类型，可选值为：`int、string、float、boolean` | string | 是
visitor | 属性visitor配置| *[PropertyVisitor](#propertyvisitor) | 是
value | 配置属性的值 | string | 否

#### PropertyVisitor

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
register | 可选值：CoilRegister、DiscreteInputRegister、HoldingRegister或InputRegister| string | 是
offset | 偏移量，读取或写入register的位置 | int | 是
quantity | 数量，可以读取或写入的register数量 | int | 是
orderOfOperations | register的数量 | [ModbusOperations](#modbusoperations) | 否

#### ModbusOperations

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
operationType | 运算类型：加减乘除(`Add, Subtract, Multiply, Divide`) | string | 否
operationValue | 运算值 | string | 否

#### DeviceExtension

- 关于Modbus设备的MQTT集成请参考[example YAML](#Modbus-DeviceLink-YAML示例)。
- 参考[与MQTT文档集成](./mqtt-extension)了解更多详细信息。
