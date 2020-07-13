---
id: opc-ua
title: OPC-UA 适配器
---

### 介绍

[OPC Unified Architecture](https://opcfoundation.org/about/opc-technologies/opc-ua/)（OPC-UA）是由OPC Foundation开发的用于工业自动化的机器对机器通信协议。

OPC-UA适配器集成了[gopcua](https://github.com/gopcua/opcua)，并专注于与工业OPC-UA设备和系统进行通信，以便在边缘侧进行数据收集和数据处理。

### 注册信息

| 版本 | 注册名称 | 端点 Socket | 是否可用 |
|:---|:---|:---|:---|
|  `v1alpha1` | `adaptors.edge.cattle.io/opcua` | `opcua.sock` | * |

### 支持模型

| 类型 | 设备组 | 版本 | 是否可用 | 
|:---|:---|:---|:---|
| `OPCUADevice` | `devices.edge.cattle.io` | `v1alpha1` | * |

### 支持平台

| 操作系统 | 架构 |
|:---|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

### 使用方式

```shell script
$ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/opcua/deploy/e2e/all_in_one.yaml
```

### 权限

对Octopus授予权限，如下所示：

```text
  Resources                                   Non-Resource URLs  Resource Names  Verbs
  ---------                                   -----------------  --------------  -----
  opcuadevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  opcuadevices.devices.edge.cattle.io/status  []                 []              [get patch update]
```

### OPC-UA DeviceLink YAML

OPC-UA `DeviceLink` YAML的示例：

```yaml
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  name: opcua-open
spec:
  adaptor:
    node: edge-worker
    name: adaptors.edge.cattle.io/opcua
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "OPCUADevice"
  template:
    metadata:
      labels:
        device: opcua-open
    spec:
      parameters:
        syncInterval: 10s
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
        url: opc.tcp://192.168.64.5:30839/
      properties:
        - name: datetime
          description: the current datetime
          readOnly: true
          visitor:
            nodeID: ns=0;i=2258
          dataType: datetime
        - name: integer
          description: mock number. Default value is 42
          readOnly: false
          visitor:
            nodeID: ns=1;s=the.answer
          dataType: int32
          value: "1"
        - name: string
          description: mock byte string. Default value is "test123"
          readOnly: false
          visitor:
            nodeID: ns=1;s=myByteString
          dataType: byteString
          value: "newString"
```

### OPC-UA Device Spec

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
parameters | opcua 设备的参数| *[DeviceParamters](#deviceparamters) | 否
protocol | 访问opcua 设备时使用的网络传输协议  | *[ProtocolConfig](#protocolconfig) | 是
properties | 设备属性  | []*[DeviceProperty](#deviceproperty) | 否
extension | OPC-UA设备的MQTT集成  | *[DeviceExtension](#deviceextension) | 否

#### DeviceParamters

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
syncInterval | 同步设备属性的间隔时间，默认值为5秒  | string | 否
timeout |  设备连接超时时间，默认值为10秒          | string | 否

#### ProtocolConfig

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
url | opc-ua server 的端点 | string | 是
username | opc-ua server用户名 | string | 否
password | opc-ua server 用户密码| string | 否
securityPolicy | 安全策略，可选值为：`None, Basic128Rsa15, Basic256, Basic256Sha256, Aes128Sha256RsaOaep, Aes256Sha256RsaPss`，默认值为 `None`| string | 否
securityMode | 安全模式，可选值为：`None, Sign, and SignAndEncrypt`，默认值为 `None` | string | 否
certificateFile | 访问opc-ua server时使用的证书文件 | string | 是
privateKeyFile | 访问opc-ua server时使用的私钥文件 | string | 是

#### DeviceProperty

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
name | 属性名称 | string | 是
description | 属性描述  | string | 否
readOnly | 是否只读，默认值为`false` | boolean | 否
dataType | 属性的数据类型 | *[PropertyDataType](#propertydatatype) | 是
visitor | 属性visitor配置| *[PropertyVisitor](#propertyvisitor) | 是
value | 配置属性的值 | string | 否

#### PropertyVisitor

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
nodeID | opc-ua节点ID，例如 ns=1,i=1005 | string | 是
browseName | opc-ua node节点名称 | string | 否


#### PropertyDataType

参数 | 描述| 类型 |
:--- | :--- | :--- 
boolean | Property data type is boolean. | string
int64 | 64位整数(64bit interger)，占8个字节，相当于long | string
int32 | 32位整数(32bit interger)，占4个字节，相当于int| string
int16 |  16位整数(16bit integer)，占2个字节，相当于short| string
uint64 | 数据类型是uint64 | string
uint32 |  数据类型是uint32 | string
uint16 |  数据类型是uint16 | string
float |  数据类型是float| string
double |  数据类型是double | string
string |  数据类型是string | string
byteString |  数据类型是bytestring，会被转换为string显示 | string
datetime |  数据类型是datetime | string


#### DeviceExtension

- 关于OPC-UA设备的MQTT集成请参考[example YAML](#opc-ua-devicelink-yaml)。
- 参考[与MQTT文档集成](./mqtt-extension)了解更多详细信息。
