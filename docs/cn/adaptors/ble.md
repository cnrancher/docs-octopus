---
id: ble
title: BLE 适配器
---

### 介绍

BLE代表低功耗蓝牙（通常称为BlueTooth Smart）。 BLE是一种设计用于短距离通信的无线通信形式。

BLE适配器实现了蓝牙协议的支持，并用于定义所连接的BLE设备的属性与配置。

### 注册信息

|  版本 | 注册名称 | 端点 Socket | 是否可用 |
|:---|:---|:---|:---|
|  `v1alpha1` | `adaptors.edge.cattle.io/ble` | `ble.sock` | * |

### 支持模型

| 类型 | 设备组 | 版本 | 是否可用 | 
|:---|:---|:---|:---|
| `BluetoothDevice` | `devices.edge.cattle.io` | `v1alpha1` | * |

### 支持平台

| 操作系统 | 架构 |
|:---|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

### 使用方式

```shell script
$ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/ble/deploy/e2e/all_in_one.yaml
```

### 权限

对Octopus授予权限，如下所示：

```text
  Resources                                   Non-Resource URLs  Resource Names  Verbs
  ---------                                   -----------------  --------------  -----
  bluetoothdevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  bluetoothdevices.devices.edge.cattle.io/status  []                 []              [get patch update]
```

### BLE deviceLink YAML示例

BEL `DeviceLink` YAML的示例

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
        timeout: 10s
      extension:
        mqtt:
          client:
            server: tcp://test.mosquitto.org:1883
          message:
            topic:
              prefix: cattle.io/octopus
              with: nn # namespace/name
      protocol:
        name: "MJ_HT_V1"
        macAddress: ""
      properties:
      - name: data
        description: XiaoMi temp sensor with temperature and humidity data
        accessMode: NotifyOnly
        visitor:
          characteristicUUID: 226c000064764566756266734470666d
```

有关更多BLE `DeviceLink`示例，请参考[deploy/e2e](https://github.com/cnrancher/octopus/tree/master/adaptors/ble/deploy/e2e)目录。

### BLE Device 参数说明 

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
parameters | BLE设备的参数| *[DeviceParamters](#deviceparamters) | 否
protocol | 访问BLE设备时使用的传输协议  | [DeviceProtocol](#deviceprotocol) | 是
properties | 设备属性    | *[DeviceProperty](#deviceproperty) | false
extension | OPC-UA设备的MQTT集成  | *[DeviceExtension](#deviceextension) | 否


#### DeviceParamters

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
syncInterval | 同步设备属性的间隔时间，默认值为15秒  | string | 否
timeout |  设备连接超时时间，默认值为10秒          | string | 否

#### DeviceProtocol

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
name | 设备名称  | string | 否，提供了macAddress时，非必填
macAddress |  设备访问的MacAddress  | string | 否，提供了设备名称时，非必填

#### DeviceProperty

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
name | 属性名称  | string | 是
description |  属性描述  | string | 否
accessMode | 属性的访问权限  | *[PropertyAccessMode](#propertyaccessmode) | 是
visitor | Property visitor | *[PropertyVisitor](#propertyvisitor) | 是

#### PropertyAccessMode

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
ReadOnly   | 只读  | string | 否
ReadWrite  | 读写  | string | 否
NotifyOnly | 只发送通知 | string | 否

#### PropertyVisitor

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
characteristicUUID | 属性的UUID  | string | 是
defaultValue | 当AccessMode为`ReadWrite`时，为蓝牙设备开放写入数据的权限  | string | 否
dataWrite | 将字符串数据转换为蓝牙设备可以读取的模式，例如：`"ON":[1], "OFF":[0]` | string | 否
dataConverter | 将蓝牙设备发送的数据转换为字符串 | *[BluetoothDataConverter](#bluetoothdataconverter) | 否

#### BluetoothDataConverter

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
startIndex | 指定开始转换字节流的位置  | int | 是
endIndex | 指定停止转换字节流的位置 | int | 是
shiftLeft | 指定向左位移的的字节数量 | int | 否
shiftRight | 指定向右位移的的字节数量 | int | 否
orderOfOperations | 指定操作的执行顺序 | []*[BluetoothOperations](#BluetoothOperations) | 否

#### BluetoothOperations

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
operationType | 指定操作的类型 | *[BluetoothArithmeticOperationType](#bluetootharithmeticoperationtype) | 是
operationValue | 指定执行该操作的值| string | 是

#### BluetoothArithmeticOperationType

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
Add | 加法 | string | 否
Subtract | 减法 | string | 否
Multiply | 乘法 | string | 否
Divide | 除法 | string | 否

#### DeviceExtension

- 关于BLE设备的MQTT集成请参考[example YAML](#BLE-deviceLink-YAML示例)。
- 参考[与MQTT文档集成](./mqtt-extension)了解更多详细信息。
